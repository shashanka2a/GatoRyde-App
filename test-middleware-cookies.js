#!/usr/bin/env node

/**
 * Middleware Cookie Test Script
 * 
 * This script specifically tests the middleware's cookie detection behavior
 * to verify if the authentication issue is fixed.
 * 
 * Usage: node test-middleware-cookies.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Middleware-Test-Script/1.0',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testMiddlewareBehavior() {
  log('\n🔍 Testing Middleware Cookie Detection', 'cyan');
  log('=' * 40, 'cyan');
  
  const testCases = [
    {
      name: 'Protected route without cookies',
      url: '/dashboard',
      cookies: {},
      expectedStatus: [302, 307], // Should redirect
      expectedLocation: '/auth/login',
    },
    {
      name: 'Protected route with uid only',
      url: '/dashboard',
      cookies: { uid: 'test-user-123' },
      expectedStatus: [302, 307], // Should redirect (missing eduVerified)
      expectedLocation: '/auth/login',
    },
    {
      name: 'Protected route with eduVerified only',
      url: '/dashboard',
      cookies: { eduVerified: '1' },
      expectedStatus: [302, 307], // Should redirect (missing uid)
      expectedLocation: '/auth/login',
    },
    {
      name: 'Protected route with both cookies',
      url: '/dashboard',
      cookies: { uid: 'test-user-123', eduVerified: '1' },
      expectedStatus: [200], // Should allow access
    },
    {
      name: 'API route without cookies',
      url: '/api/profile',
      cookies: {},
      expectedStatus: [200, 401, 403], // API should handle its own auth
    },
    {
      name: 'API route with both cookies',
      url: '/api/profile',
      cookies: { uid: 'test-user-123', eduVerified: '1' },
      expectedStatus: [200, 401, 403], // API should handle its own auth
    },
    {
      name: 'Public route without cookies',
      url: '/',
      cookies: {},
      expectedStatus: [200], // Should allow access
    },
    {
      name: 'Public route with cookies',
      url: '/',
      cookies: { uid: 'test-user-123', eduVerified: '1' },
      expectedStatus: [200], // Should allow access
    },
  ];

  const results = [];

  for (const testCase of testCases) {
    log(`\n🧪 Testing: ${testCase.name}`, 'blue');
    
    try {
      const cookieString = Object.entries(testCase.cookies)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
      
      const headers = {};
      if (cookieString) {
        headers['Cookie'] = cookieString;
      }
      
      const response = await makeRequest(`${BASE_URL}${testCase.url}`, { headers });
      
      const statusMatch = testCase.expectedStatus.includes(response.statusCode);
      const locationMatch = !testCase.expectedLocation || 
        (response.headers.location && response.headers.location.includes(testCase.expectedLocation));
      
      const passed = statusMatch && locationMatch;
      
      if (passed) {
        log(`✅ PASS - Status: ${response.statusCode}`, 'green');
        if (response.headers.location) {
          log(`   Redirect: ${response.headers.location}`, 'green');
        }
      } else {
        log(`❌ FAIL - Expected status: ${testCase.expectedStatus}, got: ${response.statusCode}`, 'red');
        if (testCase.expectedLocation && response.headers.location) {
          log(`   Expected redirect: ${testCase.expectedLocation}`, 'red');
          log(`   Actual redirect: ${response.headers.location}`, 'red');
        }
      }
      
      results.push({
        ...testCase,
        actualStatus: response.statusCode,
        actualLocation: response.headers.location,
        passed,
      });
      
    } catch (error) {
      log(`❌ ERROR - ${error.message}`, 'red');
      results.push({
        ...testCase,
        error: error.message,
        passed: false,
      });
    }
  }

  // Summary
  log('\n📊 Test Results Summary', 'cyan');
  log('=' * 30, 'cyan');
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });
  
  log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'green' : 'yellow');

  if (passedTests === totalTests) {
    log('\n🎉 All middleware tests passed! Cookie detection is working correctly.', 'green');
  } else {
    log('\n⚠️ Some middleware tests failed. Issues detected:', 'yellow');
    
    const failedTests = results.filter(r => !r.passed);
    failedTests.forEach(test => {
      log(`\n🔍 Failed test: ${test.name}`, 'red');
      if (test.error) {
        log(`   Error: ${test.error}`, 'red');
      } else {
        log(`   Expected status: ${test.expectedStatus}`, 'red');
        log(`   Actual status: ${test.actualStatus}`, 'red');
        if (test.expectedLocation) {
          log(`   Expected redirect: ${test.expectedLocation}`, 'red');
          log(`   Actual redirect: ${test.actualLocation || 'none'}`, 'red');
        }
      }
    });
    
    log('\n🔧 Potential fixes:', 'cyan');
    log('1. Check if middleware is correctly reading uid and eduVerified cookies', 'cyan');
    log('2. Verify cookie names match between setAuthCookies and getAuthCookies', 'cyan');
    log('3. Check if cookies are being set with correct domain/path settings', 'cyan');
    log('4. Verify middleware logic for protected vs public routes', 'cyan');
  }

  return results;
}

// Run the test
if (require.main === module) {
  testMiddlewareBehavior()
    .then(() => {
      log('\n✨ Middleware test completed', 'cyan');
      process.exit(0);
    })
    .catch((error) => {
      log(`\n💥 Test crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testMiddlewareBehavior };

