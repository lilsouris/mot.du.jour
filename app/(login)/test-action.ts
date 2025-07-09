'use server';

export async function testAction() {
  console.log('🔥 TEST ACTION CALLED - THIS SHOULD APPEAR IN TERMINAL');
  return { message: 'Test action worked!' };
}