#!/usr/bin/env node

/**
 * Authentication Test Runner
 * 
 * This script runs all authentication tests to verify if the cookie issue is fixed.
 * 
 * Usage: node run-auth-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

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

function runTest(testFile, testName) {
  return new Promise((resolve) => {
    log(`\n🧪 Running ${testName}...`, 'blue');
    log('=' * 50, 'blue');
    
    const child = spawn('node', [testFile], {
      stdio: 'inherit',
      cwd: __dirname,
    });
    
    child.on('close', (code) => {
      const success = code === 0;
      log(`\n${success ? '✅' : '❌'} ${testName} ${success ? 'PASSED' : 'FAILED'}`, 
          success ? 'green' : 'red');
      resolve(success);
    });
    
    child.on('error', (error) => {
      log(`\n💥 ${testName} crashed: ${error.message}`, 'red');
      resolve(false);
    });
  });
}

async function runAllTests() {
  log('\n🚀 Starting Authentication Tests', 'cyan');
  log('=' * 40, 'cyan');
  
  const tests = [
    {
      file: 'test-middleware-cookies.js',
      name: 'Middleware Cookie Detection Test',
    },
    {
      file: 'test-login-cookies.js',
      name: 'Login Cookie Setting Test',
    },
    {
      file: 'test-auth-cookies.js',
      name: 'Comprehensive Auth Flow Test',
    },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await runTest(test.file, test.name);
    results.push({
      name: test.name,
      success,
    });
  }
  
  // Final summary
  log('\n📊 Final Test Results', 'cyan');
  log('=' * 25, 'cyan');
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`${status} ${result.name}`, color);
  });
  
  log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`, 
      passedTests === totalTests ? 'green' : 'yellow');

  if (passedTests === totalTests) {
    log('\n🎉 ALL TESTS PASSED!', 'green');
    log('The authentication cookie issue appears to be FIXED!', 'green');
    log('\n✅ Middleware is correctly detecting auth cookies', 'green');
    log('✅ Login flow is setting cookies properly', 'green');
    log('✅ Protected routes are accessible with valid cookies', 'green');
  } else {
    log('\n⚠️ SOME TESTS FAILED!', 'yellow');
    log('The authentication cookie issue is NOT fully resolved.', 'yellow');
    
    const failedTests = results.filter(r => !r.success);
    log('\n🔍 Failed tests:', 'red');
    failedTests.forEach(test => {
      log(`   - ${test.name}`, 'red');
    });
    
    log('\n🔧 Next steps to fix the issue:', 'cyan');
    log('1. Check the detailed output above for specific failures', 'cyan');
    log('2. Verify that setAuthCookies is being called after login', 'cyan');
    log('3. Check cookie domain/path settings in production', 'cyan');
    log('4. Ensure middleware is reading the correct cookie names', 'cyan');
    log('5. Test with a real browser to check for security restrictions', 'cyan');
  }
  
  log('\n✨ Test suite completed', 'cyan');
  return passedTests === totalTests;
}

// Run all tests
if (require.main === module) {
  runAllTests()
    .then((allPassed) => {
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      log(`\n💥 Test runner crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
