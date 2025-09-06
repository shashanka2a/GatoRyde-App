#!/usr/bin/env tsx

// Test script to verify .edu email authentication functionality
import { 
  isEduEmail, 
  getEmailDomain, 
  getUniversityInfo, 
  getUniversityName, 
  validateEduEmail 
} from '../lib/auth/university-detector'

console.log('🎓 Testing .edu Email Authentication System\n')

// Test cases
const testEmails = [
  'student@ufl.edu',
  'john.doe@mit.edu', 
  'jane@harvard.edu',
  'test@unknown.edu',
  'user@gmail.com',
  'invalid-email'
]

testEmails.forEach(email => {
  console.log(`📧 Testing: ${email}`)
  
  // Test basic .edu detection
  console.log(`  Is .edu: ${isEduEmail(email)}`)
  
  if (isEduEmail(email)) {
    // Test domain extraction
    console.log(`  Domain: ${getEmailDomain(email)}`)
    
    // Test university info
    const info = getUniversityInfo(email)
    if (info) {
      console.log(`  University: ${info.name}`)
      console.log(`  Location: ${info.city}, ${info.state}`)
    } else {
      console.log(`  University: Unknown (fallback: ${getUniversityName(email)})`)
    }
  }
  
  // Test validation
  const validation = validateEduEmail(email)
  console.log(`  Valid: ${validation.isValid}`)
  if (!validation.isValid) {
    console.log(`  Error: ${validation.error}`)
  }
  
  console.log('')
})

console.log('✅ .edu Email Authentication Test Complete')