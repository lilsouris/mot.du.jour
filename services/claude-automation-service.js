const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

class ClaudeAutomationService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
    this.isLoggedIn = false;
    this.messageQueue = [];
    this.isProcessing = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🚀 Initializing Claude automation service...');

      this.browser = await puppeteer.launch({
        headless: false, // Set to true in production, false for setup
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });

      this.page = await this.browser.newPage();

      // Set user agent to avoid detection
      await this.page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      );

      // Go to Claude.ai
      console.log('📱 Navigating to Claude.ai...');
      await this.page.goto('https://claude.ai/chats', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      this.isInitialized = true;
      console.log(
        '✅ Browser initialized. Please log in manually to Claude.ai'
      );

      // Check for login status periodically
      this.checkLoginStatus();
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      throw error;
    }
  }

  async checkLoginStatus() {
    const maxAttempts = 60; // 5 minutes
    let attempts = 0;

    const checkInterval = setInterval(async () => {
      try {
        attempts++;

        // Check if we're on the chat page (indicates logged in)
        const url = this.page.url();
        const hasNewChatButton = await this.page
          .$(
            'button[aria-label*="Start new chat"], button:has-text("New Chat"), [data-testid*="new-chat"]'
          )
          .catch(() => null);
        const hasChatInput = await this.page
          .$('div[contenteditable="true"], textarea[placeholder*="Message"]')
          .catch(() => null);

        if (
          (url.includes('/chats') || url.includes('/chat')) &&
          (hasNewChatButton || hasChatInput)
        ) {
          this.isLoggedIn = true;
          console.log('✅ Successfully logged in to Claude.ai!');
          clearInterval(checkInterval);
          this.startMessageProcessing();
        } else if (attempts >= maxAttempts) {
          console.log(
            '⏰ Timeout waiting for login. Please ensure you are logged in to Claude.ai'
          );
          clearInterval(checkInterval);
        } else {
          console.log(`⏳ Waiting for login... (${attempts}/${maxAttempts})`);
        }
      } catch (error) {
        console.log('🔄 Checking login status...');
      }
    }, 5000);
  }

  async startMessageProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    console.log('🎯 Ready to process message generation requests!');

    // Process any queued messages
    while (this.messageQueue.length > 0) {
      const request = this.messageQueue.shift();
      try {
        const result = await this.generateMessage(
          request.userRole,
          request.previousCount
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  async generateMessage(userRole = 'Personnel', previousCount = 0) {
    if (!this.isLoggedIn) {
      throw new Error('Not logged in to Claude.ai. Please log in first.');
    }

    try {
      console.log(
        `🤖 Generating message for ${userRole} user (${previousCount} previous messages)`
      );

      const prompt = this.buildPrompt(userRole, previousCount);

      // Find and click input field
      const inputSelectors = [
        'div[contenteditable="true"][data-testid*="chat-input"]',
        'div[contenteditable="true"]',
        'textarea[placeholder*="Message"]',
        '[data-testid="chat-input"]',
      ];

      let input = null;
      for (const selector of inputSelectors) {
        input = await this.page.$(selector).catch(() => null);
        if (input) break;
      }

      if (!input) {
        // Try to start a new chat
        const newChatSelectors = [
          'button[aria-label*="Start new chat"]',
          'button:has-text("New Chat")',
          '[data-testid*="new-chat"]',
          'a[href*="/chat"]',
        ];

        for (const selector of newChatSelectors) {
          const newChatBtn = await this.page.$(selector).catch(() => null);
          if (newChatBtn) {
            await newChatBtn.click();
            await this.page.waitForTimeout(2000);
            break;
          }
        }

        // Try to find input again
        for (const selector of inputSelectors) {
          input = await this.page.$(selector).catch(() => null);
          if (input) break;
        }
      }

      if (!input) {
        throw new Error(
          'Could not find chat input field. Please check Claude.ai interface.'
        );
      }

      // Clear input and type prompt
      await input.click();
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await input.type(prompt);

      // Send message
      await this.page.keyboard.press('Enter');

      console.log('📤 Message sent, waiting for response...');

      // Wait for response
      await this.page.waitForTimeout(3000);

      // Wait for response to appear (look for streaming to stop)
      let lastMessageLength = 0;
      let stableCount = 0;

      for (let i = 0; i < 30; i++) {
        // 30 seconds max
        const messages = await this.page
          .$$eval(
            'div[data-testid*="message"], .message-content, [role="assistant"] div, .markdown',
            elements =>
              elements
                .map(el => el.textContent?.trim())
                .filter(text => text && text.length > 10)
          )
          .catch(() => []);

        const currentMessage = messages[messages.length - 1];
        const currentLength = currentMessage?.length || 0;

        if (currentLength === lastMessageLength && currentLength > 0) {
          stableCount++;
          if (stableCount >= 3) break; // Message stable for 3 checks
        } else {
          stableCount = 0;
        }

        lastMessageLength = currentLength;
        await this.page.waitForTimeout(1000);
      }

      // Get the final response
      const messages = await this.page.$$eval(
        'div[data-testid*="message"], .message-content, [role="assistant"] div, .markdown',
        elements =>
          elements
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 10)
      );

      const latestMessage = messages[messages.length - 1];

      if (!latestMessage) {
        throw new Error('No response received from Claude');
      }

      const cleanedMessage = this.cleanMessage(latestMessage);
      console.log(`✅ Generated message: "${cleanedMessage}"`);

      return cleanedMessage;
    } catch (error) {
      console.error('❌ Error generating message:', error);
      throw error;
    }
  }

  buildPrompt(userRole, previousCount) {
    const roleContext = this.getRoleContext(userRole);
    const varietyPrompt = this.getVarietyPrompt(previousCount);

    return `Tu es un assistant bienveillant spécialisé en santé mentale. ${roleContext}

${varietyPrompt}

Génère un message quotidien unique en français qui respecte ces critères :
- 50 à 140 caractères maximum (adapté pour SMS)
- Ton positif, encourageant et bienveillant
- Axé sur le bien-être mental, la mindfulness, ou la gratitude
- Personnel et chaleureux (pas de platitudes génériques)
- Créatif et inspirant
- Approprié pour tous les âges

Exemples de styles :
- "Aujourd'hui, respire profondément. Ton calme intérieur est ta force. 🌸"
- "Chaque petite victoire compte. Célèbre tes progrès, même les plus discrets. ✨"
- "Prends un moment pour toi. Tu mérites cette pause bien-être. 💙"

Réponds uniquement avec le message final, sans explications ni formatage markdown.`;
  }

  getRoleContext(userRole) {
    switch (userRole) {
      case 'Personnel':
        return "Tu t'adresses à une personne cherchant un développement personnel quotidien.";
      case 'Famille':
        return "Tu t'adresses à quelqu'un partageant ce bien-être avec sa famille.";
      case 'Cadeau':
        return "Tu t'adresses à quelqu'un qui reçoit ces messages comme un cadeau bienveillant.";
      default:
        return "Tu t'adresses à une personne souhaitant améliorer son bien-être quotidien.";
    }
  }

  getVarietyPrompt(previousCount) {
    if (previousCount > 50) {
      return 'Cette personne reçoit des messages depuis longtemps. Sois particulièrement créatif et évite les thèmes répétitifs. Explore des angles nouveaux et originaux.';
    } else if (previousCount > 10) {
      return "Cette personne a déjà reçu plusieurs messages. Assure-toi d'être original et d'éviter les répétitions.";
    }
    return 'Génère un message engageant pour motiver cette personne dans son parcours de bien-être.';
  }

  cleanMessage(message) {
    return message
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^\s*-\s*/, '') // Remove leading dash
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '') // Remove markdown italic
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .trim();
  }

  async queueMessage(userRole, previousCount) {
    return new Promise((resolve, reject) => {
      if (this.isLoggedIn) {
        this.generateMessage(userRole, previousCount)
          .then(resolve)
          .catch(reject);
      } else {
        this.messageQueue.push({ userRole, previousCount, resolve, reject });
      }
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.isInitialized = false;
      this.isLoggedIn = false;
    }
  }
}

// Create service instance
const claudeService = new ClaudeAutomationService();

// API Routes
app.post('/generate-message', async (req, res) => {
  try {
    // Verify webhook secret
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.WEBHOOK_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      user_id,
      user_role = 'Personnel',
      previous_messages_count = 0,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing required field: user_id' });
    }

    if (!claudeService.isInitialized) {
      await claudeService.initialize();
    }

    const message = await claudeService.queueMessage(
      user_role,
      previous_messages_count
    );

    res.json({
      success: true,
      message,
      user_id,
      provider: 'claude-web',
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to generate message',
      details: error.message,
    });
  }
});

app.get('/status', (req, res) => {
  res.json({
    initialized: claudeService.isInitialized,
    logged_in: claudeService.isLoggedIn,
    queue_length: claudeService.messageQueue.length,
    uptime: process.uptime(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Claude automation service...');
  await claudeService.close();
  process.exit(0);
});

const PORT = process.env.CLAUDE_SERVICE_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🤖 Claude Automation Service running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);

  // Auto-initialize
  claudeService.initialize().catch(console.error);
});

module.exports = { ClaudeAutomationService };
