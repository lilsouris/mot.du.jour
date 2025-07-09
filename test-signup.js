// Simple test script to simulate the signup process
const formData = new FormData();
formData.append('email', 'test@test.com');
formData.append('password', 'password123');
formData.append('phoneNumber', '123456789');
formData.append('phoneCountry', '+33');

console.log('Form data:', Object.fromEntries(formData));

// Test the Zod validation
const { z } = require('zod');

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phoneNumber: z.string().optional(),
  phoneCountry: z.string().optional(),
  inviteId: z.string().optional()
});

const result = signUpSchema.safeParse(Object.fromEntries(formData));
console.log('Validation result:', result);

if (!result.success) {
  console.log('Validation errors:', result.error.errors);
} else {
  console.log('Validation passed!');
  console.log('Parsed data:', result.data);
}