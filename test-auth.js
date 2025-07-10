// Simple test to check authentication
const { execSync } = require('child_process');

console.log('Testing authentication...');

try {
  // Test login endpoint
  const response = execSync('curl -s "http://localhost:3000/api/user"', { encoding: 'utf8' });
  console.log('API Response:', response);
  
} catch (error) {
  console.error('Error:', error.message);
}