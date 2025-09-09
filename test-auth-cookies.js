#!/usr/bin/env node

/**
 * Authentication Cookie Test Script
 * 
 * This script tests the authentication flow to verify if cookies are being
 * set properly after login and if the middleware is detecting them correctly.
 * 
 * Usage: node test-auth-cookies.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@university.edu';
const TEST_PHONE = process.env.TEST_PHONE || '+1234567890';

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
        'User-Agent': 'Auth-Test-Script/1.0',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

function extractCookies(headers) {
  const setCookieHeaders = headers['set-cookie'] || [];
  const cookies = {};
  
  setCookieHeaders.forEach(cookieHeader => {
    const [nameValue] = cookieHeader.split(';');
    const [name, value] = nameValue.split('=');
    if (name && value) {
      cookies[name.trim()] = value.trim();
    }
  });
  
  return cookies;
}

function formatCookies(cookies) {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

async function testAuthFlow() {
  log('\n🔍 Starting Authentication Cookie Test', 'cyan');
  log('=' * 50, 'cyan');
  
  let sessionCookies = {};
  let testResults = {
    loginFlow: false,
    cookieSetting: false,
    middlewareDetection: false,
    protectedRouteAccess: false,
    debugEndpoint: false,
  };

  try {
    // Step 1: Test debug endpoint (should work without auth)
    log('\n📊 Step 1: Testing debug endpoint...', 'blue');
    const debugResponse = await makeRequest(`${BASE_URL}/api/_debug/auth-status`);
    
    if (debugResponse.statusCode === 200) {
      log('✅ Debug endpoint accessible', 'green');
      testResults.debugEndpoint = true;
      
      log('📋 Current auth status:', 'yellow');
      console.log(JSON.stringify(debugResponse.data, null, 2));
    } else {
      log(`❌ Debug endpoint failed: ${debugResponse.statusCode}`, 'red');
    }

    // Step 2: Test protected route without auth (should redirect)
    log('\n🔒 Step 2: Testing protected route without auth...', 'blue');
    const protectedResponse = await makeRequest(`${BASE_URL}/dashboard`);
    
    if (protectedResponse.statusCode === 302 || protectedResponse.statusCode === 307) {
      const location = protectedResponse.headers.location;
      if (location && location.includes('/auth/login')) {
        log('✅ Middleware correctly redirects to login', 'green');
        testResults.middlewareDetection = true;
      } else {
        log(`❌ Unexpected redirect location: ${location}`, 'red');
      }
    } else {
      log(`❌ Expected redirect (302/307), got: ${protectedResponse.statusCode}`, 'red');
    }

    // Step 3: Test login flow
    log('\n🔐 Step 3: Testing login flow...', 'blue');
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login-otp`, {
      method: 'POST',
      body: {
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        university: 'Test University',
      },
    });

    if (loginResponse.statusCode === 200 && loginResponse.data.success) {
      log('✅ Login successful', 'green');
      testResults.loginFlow = true;
      
      // Extract cookies from login response
      const newCookies = extractCookies(loginResponse.headers);
      sessionCookies = { ...sessionCookies, ...newCookies };
      
      log('🍪 Cookies set after login:', 'yellow');
      Object.entries(newCookies).forEach(([name, value]) => {
        const displayValue = name.includes('token') ? '[REDACTED]' : value;
        log(`  ${name}: ${displayValue}`, 'yellow');
      });
      
      // Check for required auth cookies
      if (newCookies.uid && newCookies.eduVerified) {
        log('✅ Required auth cookies (uid, eduVerified) are set', 'green');
        testResults.cookieSetting = true;
      } else {
        log('❌ Missing required auth cookies', 'red');
        log(`  uid: ${newCookies.uid ? '✅' : '❌'}`, 'red');
        log(`  eduVerified: ${newCookies.eduVerified ? '✅' : '❌'}`, 'red');
      }
    } else {
      log(`❌ Login failed: ${loginResponse.statusCode}`, 'red');
      if (loginResponse.data) {
        log(`  Error: ${loginResponse.data.message || 'Unknown error'}`, 'red');
      }
    }

    // Step 4: Test protected route with auth cookies
    if (Object.keys(sessionCookies).length > 0) {
      log('\n🛡️ Step 4: Testing protected route with auth cookies...', 'blue');
      
      const protectedWithAuthResponse = await makeRequest(`${BASE_URL}/dashboard`, {
        headers: {
          'Cookie': formatCookies(sessionCookies),
        },
      });
      
      if (protectedWithAuthResponse.statusCode === 200) {
        log('✅ Protected route accessible with auth cookies', 'green');
        testResults.protectedRouteAccess = true;
      } else if (protectedWithAuthResponse.statusCode === 302 || protectedWithAuthResponse.statusCode === 307) {
        log('❌ Still getting redirected despite having auth cookies', 'red');
        log(`  Redirect location: ${protectedWithAuthResponse.headers.location}`, 'red');
      } else {
        log(`❌ Unexpected status code: ${protectedWithAuthResponse.statusCode}`, 'red');
      }
    } else {
      log('⚠️ Skipping protected route test - no cookies available', 'yellow');
    }

    // Step 5: Test API endpoint with auth cookies
    if (Object.keys(sessionCookies).length > 0) {
      log('\n🔌 Step 5: Testing API endpoint with auth cookies...', 'blue');
      
      const apiResponse = await makeRequest(`${BASE_URL}/api/profile`, {
        headers: {
          'Cookie': formatCookies(sessionCookies),
        },
      });
      
      if (apiResponse.statusCode === 200) {
        log('✅ API endpoint accessible with auth cookies', 'green');
      } else {
        log(`❌ API endpoint failed: ${apiResponse.statusCode}`, 'red');
        if (apiResponse.data) {
          log(`  Error: ${apiResponse.data.message || 'Unknown error'}`, 'red');
        }
      }
    }

    // Step 6: Test debug endpoint with auth cookies
    if (Object.keys(sessionCookies).length > 0) {
      log('\n🔍 Step 6: Testing debug endpoint with auth cookies...', 'blue');
      
      const debugWithAuthResponse = await makeRequest(`${BASE_URL}/api/_debug/auth-status`, {
        headers: {
          'Cookie': formatCookies(sessionCookies),
        },
      });
      
      if (debugWithAuthResponse.statusCode === 200) {
        log('✅ Debug endpoint with auth shows session data', 'green');
        log('📋 Auth status with cookies:', 'yellow');
        console.log(JSON.stringify(debugWithAuthResponse.data, null, 2));
      } else {
        log(`❌ Debug endpoint with auth failed: ${debugWithAuthResponse.statusCode}`, 'red');
      }
    }

  } catch (error) {
    log(`❌ Test failed with error: ${error.message}`, 'red');
    console.error(error);
  }

  // Summary
  log('\n📊 Test Results Summary', 'cyan');
  log('=' * 30, 'cyan');
  
  const results = [
    { name: 'Debug Endpoint Access', result: testResults.debugEndpoint },
    { name: 'Middleware Redirect (No Auth)', result: testResults.middlewareDetection },
    { name: 'Login Flow Success', result: testResults.loginFlow },
    { name: 'Cookie Setting', result: testResults.cookieSetting },
    { name: 'Protected Route Access', result: testResults.protectedRouteAccess },
  ];

  results.forEach(({ name, result }) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`${status} ${name}`, color);
  });

  const passedTests = results.filter(r => r.result).length;
  const totalTests = results.length;
  
  log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'green' : 'yellow');

  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Authentication cookies are working correctly.', 'green');
  } else {
    log('\n⚠️ Some tests failed. Check the issues above.', 'yellow');
    
    if (!testResults.cookieSetting) {
      log('\n🔧 Potential fixes for cookie issues:', 'cyan');
      log('1. Check if setAuthCookies is being called after login', 'cyan');
      log('2. Verify cookie domain settings in production', 'cyan');
      log('3. Check if cookies are being cleared by browser security policies', 'cyan');
      log('4. Verify middleware is using the correct cookie names', 'cyan');
    }
  }

  return testResults;
}

// Run the test
if (require.main === module) {
  testAuthFlow()
    .then(() => {
      log('\n✨ Test completed', 'cyan');
      process.exit(0);
    })
    .catch((error) => {
      log(`\n💥 Test crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testAuthFlow };
