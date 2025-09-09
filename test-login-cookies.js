#!/usr/bin/env node

/**
 * Login Cookie Test Script
 * 
 * This script tests the actual login flow to verify if cookies are being
 * set properly after successful authentication.
 * 
 * Usage: node test-login-cookies.js
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
        'User-Agent': 'Login-Test-Script/1.0',
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

async function testLoginFlow() {
  log('\n🔐 Testing Login Cookie Setting', 'cyan');
  log('=' * 35, 'cyan');
  
  try {
    // Step 1: Test login endpoint
    log('\n📝 Step 1: Attempting login...', 'blue');
    log(`   Email: ${TEST_EMAIL}`, 'yellow');
    log(`   Phone: ${TEST_PHONE}`, 'yellow');
    
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login-otp`, {
      method: 'POST',
      body: {
        email: TEST_EMAIL,
        phone: TEST_PHONE,
        university: 'Test University',
      },
    });

    log(`\n📊 Login Response:`, 'blue');
    log(`   Status: ${loginResponse.statusCode}`, 'yellow');
    
    if (loginResponse.data) {
      log(`   Success: ${loginResponse.data.success}`, 'yellow');
      log(`   Message: ${loginResponse.data.message}`, 'yellow');
      if (loginResponse.data.user) {
        log(`   User ID: ${loginResponse.data.user.id}`, 'yellow');
        log(`   Edu Verified: ${loginResponse.data.user.eduVerified}`, 'yellow');
      }
    }

    // Step 2: Check cookies set by login
    log('\n🍪 Step 2: Analyzing cookies set by login...', 'blue');
    
    const setCookieHeaders = loginResponse.headers['set-cookie'] || [];
    log(`   Total cookies set: ${setCookieHeaders.length}`, 'yellow');
    
    if (setCookieHeaders.length === 0) {
      log('❌ No cookies were set by the login endpoint!', 'red');
      return false;
    }

    const cookies = extractCookies(loginResponse.headers);
    
    log('\n📋 Cookies set:', 'yellow');
    Object.entries(cookies).forEach(([name, value]) => {
      const displayValue = name.includes('token') || name.includes('auth') ? '[REDACTED]' : value;
      log(`   ${name}: ${displayValue}`, 'yellow');
    });

    // Step 3: Check for required auth cookies
    log('\n🔍 Step 3: Checking for required auth cookies...', 'blue');
    
    const requiredCookies = ['uid', 'eduVerified'];
    const missingCookies = [];
    const presentCookies = [];
    
    requiredCookies.forEach(cookieName => {
      if (cookies[cookieName]) {
        presentCookies.push(cookieName);
        log(`   ✅ ${cookieName}: ${cookies[cookieName]}`, 'green');
      } else {
        missingCookies.push(cookieName);
        log(`   ❌ ${cookieName}: MISSING`, 'red');
      }
    });

    // Step 4: Test if cookies work with protected routes
    if (presentCookies.length === requiredCookies.length) {
      log('\n🛡️ Step 4: Testing cookies with protected route...', 'blue');
      
      const protectedResponse = await makeRequest(`${BASE_URL}/dashboard`, {
        headers: {
          'Cookie': formatCookies(cookies),
        },
      });
      
      log(`   Protected route status: ${protectedResponse.statusCode}`, 'yellow');
      
      if (protectedResponse.statusCode === 200) {
        log('   ✅ Protected route accessible with cookies!', 'green');
      } else if (protectedResponse.statusCode === 302 || protectedResponse.statusCode === 307) {
        log('   ❌ Still getting redirected despite having cookies', 'red');
        log(`   Redirect location: ${protectedResponse.headers.location}`, 'red');
      } else {
        log(`   ⚠️ Unexpected status: ${protectedResponse.statusCode}`, 'yellow');
      }
    } else {
      log('\n⚠️ Skipping protected route test - missing required cookies', 'yellow');
    }

    // Step 5: Test API endpoint with cookies
    if (presentCookies.length === requiredCookies.length) {
      log('\n🔌 Step 5: Testing API endpoint with cookies...', 'blue');
      
      const apiResponse = await makeRequest(`${BASE_URL}/api/profile`, {
        headers: {
          'Cookie': formatCookies(cookies),
        },
      });
      
      log(`   API endpoint status: ${apiResponse.statusCode}`, 'yellow');
      
      if (apiResponse.statusCode === 200) {
        log('   ✅ API endpoint accessible with cookies!', 'green');
      } else {
        log(`   ⚠️ API endpoint status: ${apiResponse.statusCode}`, 'yellow');
        if (apiResponse.data && apiResponse.data.message) {
          log(`   Message: ${apiResponse.data.message}`, 'yellow');
        }
      }
    }

    // Summary
    log('\n📊 Login Cookie Test Summary', 'cyan');
    log('=' * 30, 'cyan');
    
    const loginSuccess = loginResponse.statusCode === 200 && loginResponse.data?.success;
    const cookiesSet = setCookieHeaders.length > 0;
    const requiredCookiesPresent = missingCookies.length === 0;
    
    log(`Login Success: ${loginSuccess ? '✅' : '❌'}`, loginSuccess ? 'green' : 'red');
    log(`Cookies Set: ${cookiesSet ? '✅' : '❌'}`, cookiesSet ? 'green' : 'red');
    log(`Required Cookies Present: ${requiredCookiesPresent ? '✅' : '❌'}`, requiredCookiesPresent ? 'green' : 'red');
    
    if (missingCookies.length > 0) {
      log(`Missing Cookies: ${missingCookies.join(', ')}`, 'red');
    }

    if (loginSuccess && cookiesSet && requiredCookiesPresent) {
      log('\n🎉 Login cookie test PASSED! Cookies are being set correctly.', 'green');
      return true;
    } else {
      log('\n⚠️ Login cookie test FAILED! Issues detected:', 'yellow');
      
      if (!loginSuccess) {
        log('   - Login endpoint is not working properly', 'red');
      }
      if (!cookiesSet) {
        log('   - No cookies are being set by the login endpoint', 'red');
      }
      if (!requiredCookiesPresent) {
        log('   - Required auth cookies (uid, eduVerified) are missing', 'red');
      }
      
      log('\n🔧 Potential fixes:', 'cyan');
      log('1. Check if setAuthCookies is being called in login-otp route', 'cyan');
      log('2. Verify cookie options (domain, path, secure, etc.)', 'cyan');
      log('3. Check if cookies are being cleared by browser security', 'cyan');
      log('4. Verify the login endpoint is actually setting cookies', 'cyan');
      
      return false;
    }

  } catch (error) {
    log(`\n💥 Test failed with error: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testLoginFlow()
    .then((success) => {
      log('\n✨ Login cookie test completed', 'cyan');
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      log(`\n💥 Test crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testLoginFlow };
