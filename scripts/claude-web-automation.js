// Claude Web Interface Automation
// This script automates claude.ai web interface to generate messages
// Run with: node scripts/claude-web-automation.js

const puppeteer = require('puppeteer');

class ClaudeWebClient {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();

    // Go to Claude.ai
    await this.page.goto('https://claude.ai/chats');

    console.log('Please log in to Claude.ai manually...');
    console.log(
      'Press Enter once you are logged in and see the chat interface'
    );

    // Wait for manual login
    await this.waitForEnter();
  }

  async generateMessage(userRole = 'Personnel', previousCount = 0) {
    try {
      const prompt = this.buildPrompt(userRole, previousCount);

      // Find the input textarea
      const inputSelector = 'div[contenteditable="true"]';
      await this.page.waitForSelector(inputSelector);

      // Clear and type the prompt
      await this.page.click(inputSelector);
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await this.page.type(inputSelector, prompt);

      // Send the message (usually Enter or a send button)
      await this.page.keyboard.press('Enter');

      // Wait for response
      await this.page.waitForTimeout(3000);

      // Get the latest response
      const messages = await this.page.$$eval(
        '.message-content', // Adjust selector based on Claude's UI
        elements => elements.map(el => el.textContent)
      );

      const latestMessage = messages[messages.length - 1];
      return this.cleanMessage(latestMessage);
    } catch (error) {
      console.error('Error generating message:', error);
      throw error;
    }
  }

  buildPrompt(userRole, previousCount) {
    const roleContext = this.getRoleContext(userRole);
    const varietyPrompt =
      previousCount > 10
        ? 'Sois particulièrement créatif et évite les thèmes répétitifs.'
        : 'Génère un message engageant.';

    return `Tu es un assistant bienveillant spécialisé en santé mentale. ${roleContext}

${varietyPrompt}

Génère un message quotidien unique en français qui respecte ces critères :
- 50 à 140 caractères maximum (adapté pour SMS)
- Ton positif, encourageant et bienveillant
- Axé sur le bien-être mental, la mindfulness, ou la gratitude
- Personnel et chaleureux (pas de platitudes génériques)
- Créatif et inspirant

Réponds uniquement avec le message, sans explications.`;
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

  cleanMessage(message) {
    return message
      .replace(/^["']|["']$/g, '')
      .replace(/^\s*-\s*/, '')
      .trim();
  }

  waitForEnter() {
    return new Promise(resolve => {
      process.stdin.once('data', () => resolve());
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Usage example
async function testClaudeWeb() {
  const claude = new ClaudeWebClient();

  try {
    await claude.initialize();
    const message = await claude.generateMessage('Personnel', 5);
    console.log('Generated message:', message);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await claude.close();
  }
}

module.exports = ClaudeWebClient;

// Run if called directly
if (require.main === module) {
  testClaudeWeb();
}
