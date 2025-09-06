// Diagnostic script to test production API endpoint
const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://www.rydify.app';

async function makeRequest(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = typeof data === 'string' ? data : JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ...headers
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
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
            parseError: true
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testProductionAPI() {
  console.log('🔍 Diagnosing Production API Issues\n');
  console.log(`Testing: ${PRODUCTION_URL}/api/auth/verify\n`);

  const tests = [
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
      name: 'Empty request',
      data: {},
      expectedStatus: 400
    },
    {
      name: 'Malformed JSON',
      data: '{email: "test@university.edu"}',
      raw: true,
      expectedStatus: 400
    },
    {
      name: 'Empty body',
      data: '',
      raw: true,
      expectedStatus: 400
    }
  ];

  let errors500 = [];
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      
      const requestData = test.raw ? test.data : test.data;
      const response = await makeRequest(`${PRODUCTION_URL}/api/auth/verify`, requestData);
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 500) {
        console.log('   🚨 500 ERROR FOUND!');
        console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
        errors500.push({
          test: test.name,
          response: response.body
        });
        failed++;
      } else if (response.status === test.expectedStatus) {
        console.log('   ✅ Expected status');
        passed++;
      } else {
        console.log(`   ⚠️  Unexpected status (expected ${test.expectedStatus})`);
        if (response.parseError) {
          console.log(`   Raw Response: ${response.body}`);
        } else {
          console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
        }
        failed++;
      }
      
      console.log('');
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`   ❌ Request Error: ${error.message}`);
      console.log('');
      failed++;
    }
  }

  console.log('📊 Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (errors500.length > 0) {
    console.log('\n🚨 500 ERRORS DETECTED:');
    errors500.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}:`);
      console.log(`   ${JSON.stringify(error.response, null, 2)}`);
    });
    
    console.log('\n🔧 Possible causes of 500 errors in production:');
    console.log('1. Missing environment variables in Vercel');
    console.log('2. Database connection issues');
    console.log('3. SMTP configuration problems');
    console.log('4. Rate limiting service errors');
    console.log('5. University validation service issues');
    console.log('6. Serverless function timeout');
    console.log('7. Memory limits exceeded');
    
    console.log('\n📋 Next steps:');
    console.log('1. Check Vercel function logs');
    console.log('2. Verify all environment variables are set');
    console.log('3. Test database connectivity');
    console.log('4. Check SMTP credentials');
    console.log('5. Review serverless function configuration');
  } else {
    console.log('\n✅ No 500 errors detected in production!');
  }
}

async function testSpecificScenario() {
  console.log('\n🎯 Testing specific browser scenario that might cause 500:\n');
  
  try {
    // Simulate exact browser request
    const response = await makeRequest(`${PRODUCTION_URL}/api/auth/verify`, 
      { email: 'sjagannatham@ufl.edu' }, // Using the email from screenshot
      {
        'Accept': 'application/json',
        'Origin': 'https://www.rydify.app',
        'Referer': 'https://www.rydify.app/',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    );
    
    console.log(`Status: ${response.status}`);
    if (response.status === 500) {
      console.log('🚨 REPRODUCED THE 500 ERROR!');
      console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
    } else {
      console.log('✅ Request successful');
      console.log(`Response: ${JSON.stringify(response.body, null, 2)}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function main() {
  await testProductionAPI();
  await testSpecificScenario();
  
  console.log('\n🔍 If 500 errors persist, check Vercel function logs at:');
  console.log('https://vercel.com/dashboard > Functions > View Function Logs');
}

main().catch(console.error);