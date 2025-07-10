// ChatGPT Web Interface Automation
// This script automates chat.openai.com to generate messages
// Run with: node scripts/chatgpt-web-automation.js

const puppeteer = require('puppeteer');

class ChatGPTWebClient {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for production
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Go to ChatGPT
    await this.page.goto('https://chat.openai.com/');
    
    console.log('Please log in to ChatGPT manually...');
    console.log('Press Enter once you are logged in and see the chat interface');
    
    // Wait for manual login
    await this.waitForEnter();
  }

  async generateMessage(userRole = 'Personnel', previousCount = 0) {
    try {
      const prompt = this.buildPrompt(userRole, previousCount);
      
      // Find the input textarea (ChatGPT's selector may change)
      const inputSelector = 'textarea[placeholder*="Message"]';
      await this.page.waitForSelector(inputSelector, { timeout: 10000 });
      
      // Clear and type the prompt
      await this.page.click(inputSelector);
      await this.page.keyboard.down('Control');
      await this.page.keyboard.press('a');
      await this.page.keyboard.up('Control');
      await this.page.type(inputSelector, prompt);
      
      // Send the message
      await this.page.keyboard.press('Enter');
      
      // Wait for response to appear
      await this.page.waitForTimeout(5000);
      
      // Get the latest response
      const messages = await this.page.$$eval(
        '[data-message-author-role="assistant"] .markdown', // Adjust based on ChatGPT's structure
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
    const varietyPrompt = previousCount > 10 ? 
      'Sois particulièrement créatif et évite les thèmes répétitifs.' : 
      'Génère un message engageant.';

    return `Tu es un assistant bienveillant spécialisé en santé mentale. ${roleContext}

${varietyPrompt}

Génère un message quotidien unique en français qui respecte ces critères :
- 50 à 140 caractères maximum (adapté pour SMS)
- Ton positif, encourageant et bienveillant
- Axé sur le bien-être mental, la mindfulness, ou la gratitude
- Personnel et chaleureux (pas de platitudes génériques)
- Créatif et inspirant

Réponds uniquement avec le message final, sans explications ni formatage markdown.`;
  }

  getRoleContext(userRole) {
    switch (userRole) {
      case 'Personnel':
        return 'Tu t\'adresses à une personne cherchant un développement personnel quotidien.';
      case 'Famille':
        return 'Tu t\'adresses à quelqu\'un partageant ce bien-être avec sa famille.';
      case 'Cadeau':
        return 'Tu t\'adresses à quelqu\'un qui reçoit ces messages comme un cadeau bienveillant.';
      default:
        return 'Tu t\'adresses à une personne souhaitant améliorer son bien-être quotidien.';
    }
  }

  cleanMessage(message) {
    return message
      .replace(/^["']|["']$/g, '')
      .replace(/^\s*-\s*/, '')
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '') // Remove markdown italic
      .trim();
  }

  waitForEnter() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => resolve());
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = ChatGPTWebClient;

// Usage example
async function testChatGPTWeb() {
  const chatgpt = new ChatGPTWebClient();
  
  try {
    await chatgpt.initialize();
    const message = await chatgpt.generateMessage('Personnel', 5);
    console.log('Generated message:', message);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await chatgpt.close();
  }
}

// Run if called directly
if (require.main === module) {
  testChatGPTWeb();
}