#!/usr/bin/env tsx

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  url: string
  expectedStatus: number
  actualStatus: number
  passed: boolean
  description: string
}

async function testRoute(path: string, expectedStatus: number, description: string, headers?: Record<string, string>): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { headers })
    
    return {
      url: path,
      expectedStatus,
      actualStatus: response.status,
      passed: response.status === expectedStatus,
      description
    }
  } catch (error) {
    return {
      url: path,
      expectedStatus,
      actualStatus: 0,
      passed: false,
      description: `${description} (Error: ${error})`
    }
  }
}

async function testAuthGates() {
  console.log('🧪 Testing Rydify Auth Gates...\n')

  const tests: Promise<TestResult>[] = [
    // Public routes (should be accessible)
    testRoute('/', 200, 'Landing page - public access'),
    testRoute('/ride', 200, 'Ride search - public access'),
    testRoute('/auth/login', 200, 'Login page - public access'),
    
    // API routes - public
    testRoute('/api/auth/session', 200, 'Session check - public API'),
    
    // Protected routes (should redirect or return 401)
    testRoute('/drive', 302, 'Drive page - should redirect to login'),
    testRoute('/profile', 302, 'Profile page - should redirect to login'),
    
    // Protected API routes (should return 401)
    testRoute('/api/rides/create', 401, 'Create ride API - should require auth'),
    testRoute('/api/profile', 401, 'Profile API - should require auth'),
  ]

  const results = await Promise.all(tests)
  
  console.log('📊 Test Results:\n')
  
  let passed = 0
  let failed = 0
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌'
    const statusText = `${result.actualStatus} (expected ${result.expectedStatus})`
    
    console.log(`${status} ${result.url} - ${statusText}`)
    console.log(`   ${result.description}\n`)
    
    if (result.passed) {
      passed++
    } else {
      failed++
    }
  })
  
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`)
  
  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Make sure your Next.js dev server is running on port 3000')
    process.exit(1)
  } else {
    console.log('\n🎉 All auth gate tests passed!')
  }
}

// Test with authenticated user
async function testWithAuth() {
  console.log('\n🔐 Testing with authenticated user...')
  
  // This would require a valid JWT token
  // For now, just show the concept
  const authHeaders = {
    'Cookie': 'auth-token=your-jwt-token-here'
  }
  
  const authTests = [
    testRoute('/drive', 200, 'Drive page - with auth', authHeaders),
    testRoute('/profile', 200, 'Profile page - with auth', authHeaders),
    testRoute('/api/rides/create', 200, 'Create ride API - with auth', authHeaders),
  ]
  
  console.log('ℹ️  Auth tests require valid JWT token (skipped in demo)')
}

testAuthGates().then(() => testWithAuth())