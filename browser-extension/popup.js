document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const status = document.getElementById('status');
  const messageDiv = document.getElementById('message');
  const userRoleSelect = document.getElementById('userRole');
  
  generateBtn.addEventListener('click', generateMessage);
  copyBtn.addEventListener('click', copyMessage);
  
  let currentMessage = '';
  
  async function generateMessage() {
    const userRole = userRoleSelect.value;
    status.textContent = 'Generating message...';
    
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.includes('claude.ai')) {
        await generateWithClaude(tab, userRole);
      } else if (tab.url.includes('chat.openai.com')) {
        await generateWithChatGPT(tab, userRole);
      } else {
        status.textContent = 'Please open Claude.ai or ChatGPT first';
        return;
      }
      
    } catch (error) {
      status.textContent = 'Error: ' + error.message;
    }
  }
  
  async function generateWithClaude(tab, userRole) {
    const prompt = buildPrompt(userRole);
    
    // Inject script to interact with Claude
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: sendMessageToClaude,
      args: [prompt]
    });
    
    if (result[0].result) {
      showMessage(result[0].result);
    } else {
      status.textContent = 'Failed to get response from Claude';
    }
  }
  
  async function generateWithChatGPT(tab, userRole) {
    const prompt = buildPrompt(userRole);
    
    // Inject script to interact with ChatGPT
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: sendMessageToChatGPT,
      args: [prompt]
    });
    
    if (result[0].result) {
      showMessage(result[0].result);
    } else {
      status.textContent = 'Failed to get response from ChatGPT';
    }
  }
  
  function buildPrompt(userRole) {
    const roleContext = getRoleContext(userRole);
    
    return `Tu es un assistant bienveillant spécialisé en santé mentale. ${roleContext}

Génère un message quotidien unique en français qui respecte ces critères :
- 50 à 140 caractères maximum (adapté pour SMS)
- Ton positif, encourageant et bienveillant
- Axé sur le bien-être mental, la mindfulness, ou la gratitude
- Personnel et chaleureux (pas de platitudes génériques)
- Créatif et inspirant

Réponds uniquement avec le message final, sans explications.`;
  }
  
  function getRoleContext(userRole) {
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
  
  function showMessage(message) {
    currentMessage = message;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    copyBtn.style.display = 'block';
    status.textContent = 'Message generated successfully!';
  }
  
  function copyMessage() {
    navigator.clipboard.writeText(currentMessage).then(() => {
      status.textContent = 'Message copied to clipboard!';
    });
  }
});

// Functions that will be injected into the page
function sendMessageToClaude(prompt) {
  return new Promise((resolve) => {
    // Find Claude's input field
    const input = document.querySelector('div[contenteditable="true"]');
    if (!input) {
      resolve(null);
      return;
    }
    
    // Send the prompt
    input.focus();
    input.textContent = prompt;
    
    // Trigger send (usually Enter key)
    const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
    input.dispatchEvent(event);
    
    // Wait for response and extract it
    setTimeout(() => {
      const messages = document.querySelectorAll('.message-content');
      const lastMessage = messages[messages.length - 1];
      resolve(lastMessage ? lastMessage.textContent.trim() : null);
    }, 5000);
  });
}

function sendMessageToChatGPT(prompt) {
  return new Promise((resolve) => {
    // Find ChatGPT's input field
    const input = document.querySelector('textarea[placeholder*="Message"]');
    if (!input) {
      resolve(null);
      return;
    }
    
    // Send the prompt
    input.focus();
    input.value = prompt;
    
    // Trigger send
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    // Find and click send button
    const sendBtn = document.querySelector('[data-testid="send-button"]');
    if (sendBtn) {
      sendBtn.click();
    } else {
      // Fallback: try Enter key
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
      input.dispatchEvent(enterEvent);
    }
    
    // Wait for response
    setTimeout(() => {
      const messages = document.querySelectorAll('[data-message-author-role="assistant"] .markdown');
      const lastMessage = messages[messages.length - 1];
      resolve(lastMessage ? lastMessage.textContent.trim() : null);
    }, 5000);
  });
}