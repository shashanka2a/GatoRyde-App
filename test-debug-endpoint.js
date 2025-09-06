const https = require('https');

async function testDebugEndpoint() {
  console.log('🔍 Testing debug endpoint to identify 500 error cause\n');

  const PRODUCTION_URL = 'https://www.rydify.app';
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: 'student@university.edu' });
    
    const options = {
      hostname: 'www.rydify.app',
      port: 443,
      path: '/api/auth/verify-debug',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 Debug Test'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          console.log(`Status: ${res.statusCode}`);
          console.log('Response:');
          console.log(JSON.stringify(jsonBody, null, 2));
          
          if (jsonBody.debug) {
            console.log('\n🔍 Debug Information:');
            console.log(`Last successful step: ${jsonBody.debug.step}`);
            console.log(`Errors encountered: ${jsonBody.debug.errors.length}`);
            
            if (jsonBody.debug.errors.length > 0) {
              console.log('\n❌ Errors:');
              jsonBody.debug.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
              });
            }
            
            console.log('\n📊 Step Status:');
            console.log(`✅ JSON Parsing: ${jsonBody.debug.bodyReceived ? 'Success' : 'Failed'}`);
            console.log(`✅ Email Validation: ${jsonBody.debug.emailValidated ? 'Success' : 'Failed'}`);
            console.log(`✅ University Validation: ${jsonBody.debug.eduValidation?.isValid ? 'Success' : 'Failed'}`);
            console.log(`✅ Rate Limiting: ${jsonBody.debug.rateLimitPassed ? 'Success' : 'Failed'}`);
            console.log(`✅ OTP Generation: ${jsonBody.debug.otpGenerated ? 'Success' : 'Failed'}`);
            console.log(`✅ Email Sending: ${jsonBody.debug.emailSent ? 'Success' : 'Failed'}`);
            console.log(`✅ Rate Limit Increment: ${jsonBody.debug.rateLimitIncremented ? 'Success' : 'Failed'}`);
            console.log(`✅ OTP Expiry: ${jsonBody.debug.expiryRetrieved ? 'Success' : 'Failed'}`);
          }
          
          resolve(jsonBody);
        } catch (e) {
          console.log(`Status: ${res.statusCode}`);
          console.log('Raw Response:', body);
          resolve({ parseError: true, body });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Request Error: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 Starting debug analysis...\n');
    await testDebugEndpoint();
    
    console.log('\n💡 Based on the debug info above, you can:');
    console.log('1. Identify which step is failing');
    console.log('2. Check the specific error messages');
    console.log('3. Fix the root cause in production');
    console.log('4. Verify environment variables for the failing service');
    
  } catch (error) {
    console.error('Debug test failed:', error.message);
  }
}

main();