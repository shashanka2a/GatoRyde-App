#!/usr/bin/env tsx

import { OTPEmailService } from '../lib/auth/otp-email'

async function testGmailSMTP() {
  console.log('Testing Gmail SMTP configuration...')
  
  try {
    // Test OTP email
    await OTPEmailService.sendOTP({
      to: 'test@example.com', // Replace with your test email
      code: '123456',
      expiresInMinutes: 10
    })
    
    console.log('✅ OTP email sent successfully!')
    
    // Test welcome email
    await OTPEmailService.sendWelcomeEmail('test@example.com', 'Test User')
    
    console.log('✅ Welcome email sent successfully!')
    console.log('🎉 Gmail SMTP is working correctly!')
    
  } catch (error) {
    console.error('❌ Gmail SMTP test failed:', error)
    process.exit(1)
  }
}

testGmailSMTP()