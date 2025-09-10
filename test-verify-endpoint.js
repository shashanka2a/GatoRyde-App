const http = require('http');

// Test configuration
const TEST_CONFIG = {
  host: 'localhost',
  port: 3000,
  path: '/api/auth/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test cases
const testCases = [
  {
    name: 'Valid .edu email',
    data: { email: 'student@university.edu' },
    expectedStatus: 200
  },
  {
    name: 'Invalid email format',
    data: { email: 'invalid-email' },
    expectedStatus: 400
  },
  {
    name: 'Non-.edu email',
    data: { email: 'user@gmail.com' },
    expectedStatus: 400
  },
  {
    name: 'Missing email',
    data: {},
    expectedStatus: 400
  },
  {
    name: 'Null email',
    data: { email: null },
    expectedStatus: 400
  },
  {
    name: 'Empty email',
    data: { email: '' },
    expectedStatus: 400
  },
  {
    name: 'Email with whitespace',
    data: { email: '  STUDENT@UNIVERSITY.EDU  ' },
    expectedStatus: 200
  }
];

// Helper function to make HTTP request
function makeRequest(testData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
    
    const options = {
      ...TEST_CONFIG,
      headers: {
        ...TEST_CONFIG.headers,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Test runner
async function runTests() {
  console.log('🧪 Testing /api/auth/verify endpoint\n');
  console.log('Make sure your Next.js server is running on http://localhost:3000\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`Request: ${JSON.stringify(testCase.data)}`);
      
      const response = await makeRequest(testCase.data);
      
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
      
      if (response.parseError) {
        console.log(`❌ Parse Error: ${response.parseError}`);
        failed++;
      } else if (response.status === testCase.expectedStatus) {
        console.log(`✅ PASS - Expected status ${testCase.expectedStatus}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected status ${testCase.expectedStatus}, got ${response.status}`);
        failed++;
      }
      
      console.log('---\n');
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      failed++;
      console.log('---\n');
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);

  if (failed > 0) {
    console.log('\n🔍 Debug Information:');
    console.log('If you see 500 errors, check:');
    console.log('1. Environment variables in .env file');
    console.log('2. Database connection');
    console.log('3. SMTP configuration');
    console.log('4. Missing dependencies');
    console.log('5. Server logs for detailed error messages');
  }
}

// Test malformed requests
async function testMalformedRequests() {
  console.log('\n🔧 Testing malformed requests:\n');

  const malformedTests = [
    {
      name: 'Invalid JSON',
      data: 'invalid json',
      raw: true
    },
    {
      name: 'Empty body',
      data: '',
      raw: true
    }
  ];

  for (const test of malformedTests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const postData = test.raw ? test.data : JSON.stringify(test.data);
      
      const options = {
        ...TEST_CONFIG,
        headers: {
          ...TEST_CONFIG.headers,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              body: body
            });
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log(`Status: ${response.status}`);
      console.log(`Response: ${response.body}`);
      console.log('---\n');

    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log('---\n');
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await new Promise((resolve, reject) => {
      const req = http.request({
        host: TEST_CONFIG.host,
        port: TEST_CONFIG.port,
        path: '/',
        method: 'GET'
      }, (res) => {
        resolve({ status: res.statusCode });
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Server connection timeout'));
      });
      req.end();
    });

    console.log('✅ Server is running\n');
    return true;
  } catch (error) {
    console.log(`❌ Server not accessible: ${error.message}`);
    console.log('Please start your Next.js server with: npm run dev\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting API endpoint tests...\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }

  await runTests();
  await testMalformedRequests();
  
  console.log('\n✨ Testing complete!');
}

// Run the tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { makeRequest, runTests };