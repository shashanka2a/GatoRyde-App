const http = require('http');

// Test the exact scenario that might be causing 500 errors
async function debugSpecificError() {
  console.log('🔍 Debugging specific 500 error scenarios\n');

  // Test cases that might cause 500 errors
  const errorTests = [
    {
      name: 'Malformed JSON - Missing quotes',
      data: '{email: "test@university.edu"}',
      raw: true
    },
    {
      name: 'Malformed JSON - Trailing comma',
      data: '{"email": "test@university.edu",}',
      raw: true
    },
    {
      name: 'Invalid Content-Type',
      data: '{"email": "test@university.edu"}',
      headers: { 'Content-Type': 'text/plain' }
    },
    {
      name: 'Missing Content-Type',
      data: '{"email": "test@university.edu"}',
      headers: {}
    },
    {
      name: 'Large payload',
      data: JSON.stringify({ 
        email: 'test@university.edu',
        extra: 'x'.repeat(10000)
      })
    },
    {
      name: 'Unicode characters',
      data: JSON.stringify({ email: 'tëst@üniversity.edu' })
    },
    {
      name: 'Very long email',
      data: JSON.stringify({ 
        email: 'a'.repeat(1000) + '@university.edu'
      })
    }
  ];

  for (const test of errorTests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const postData = test.raw ? test.data : test.data;
      
      const options = {
        host: 'localhost',
        port: 3000,
        path: '/api/auth/verify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(test.headers || {})
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              const jsonBody = JSON.parse(body);
              resolve({
                status: res.statusCode,
                body: jsonBody
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                body: body,
                parseError: true
              });
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log(`Status: ${response.status}`);
      if (response.parseError) {
        console.log(`Raw Response: ${response.body}`);
      } else {
        console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
      }
      
      if (response.status === 500) {
        console.log('🚨 Found 500 error! This might be the issue.');
      }
      
      console.log('---\n');

    } catch (error) {
      console.log(`❌ Request Error: ${error.message}`);
      console.log('---\n');
    }
  }
}

// Test browser-like requests
async function testBrowserRequests() {
  console.log('🌐 Testing browser-like requests:\n');

  const browserTests = [
    {
      name: 'Fetch API request',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      },
      data: { email: 'student@university.edu' }
    },
    {
      name: 'CORS preflight simulation',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    }
  ];

  for (const test of browserTests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const postData = test.data ? JSON.stringify(test.data) : '';
      
      const options = {
        host: 'localhost',
        port: 3000,
        path: '/api/auth/verify',
        method: test.method || 'POST',
        headers: {
          'Content-Length': Buffer.byteLength(postData),
          ...test.headers
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body
            });
          });
        });

        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
      });

      console.log(`Status: ${response.status}`);
      console.log(`Headers: ${JSON.stringify(response.headers, null, 2)}`);
      console.log(`Body: ${response.body}`);
      console.log('---\n');

    } catch (error) {
      console.log(`❌ Request Error: ${error.message}`);
      console.log('---\n');
    }
  }
}

// Main function
async function main() {
  console.log('🔧 Debugging 500 errors on /api/auth/verify\n');
  
  await debugSpecificError();
  await testBrowserRequests();
  
  console.log('💡 Common causes of 500 errors:');
  console.log('1. Malformed JSON in request body');
  console.log('2. Missing or incorrect Content-Type header');
  console.log('3. Environment variables not loaded');
  console.log('4. Database connection issues');
  console.log('5. SMTP configuration problems');
  console.log('6. Rate limiting service errors');
  console.log('7. University validation service issues');
  
  console.log('\n🔍 To debug further:');
  console.log('1. Check Next.js server console for error logs');
  console.log('2. Verify .env file has all required variables');
  console.log('3. Test database connectivity');
  console.log('4. Check SMTP credentials');
}

main().catch(console.error);