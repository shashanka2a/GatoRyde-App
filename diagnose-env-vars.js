// Check which environment variables might be missing in production
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('🔍 Environment Variables Check\n');

console.log('📋 Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const displayValue = value ? 
    (varName.includes('SECRET') || varName.includes('PASS') || varName.includes('KEY') ? 
      `${value.substring(0, 10)}...` : value) : 
    'NOT SET';
  
  console.log(`${status} ${varName}: ${displayValue}`);
});

console.log('\n🔧 Potential Issues:');

// Check SMTP configuration
const smtpVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingSmtp = smtpVars.filter(v => !process.env[v]);
if (missingSmtp.length > 0) {
  console.log(`❌ Missing SMTP variables: ${missingSmtp.join(', ')}`);
  console.log('   This would cause email sending to fail with 500 error');
}

// Check database
if (!process.env.DATABASE_URL) {
  console.log('❌ Missing DATABASE_URL');
  console.log('   This would cause OTP storage to fail with 500 error');
}

// Check Supabase
const supabaseVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingSupabase = supabaseVars.filter(v => !process.env[v]);
if (missingSupabase.length > 0) {
  console.log(`❌ Missing Supabase variables: ${missingSupabase.join(', ')}`);
  console.log('   This might cause storage operations to fail');
}

console.log('\n💡 Next Steps:');
console.log('1. Ensure all missing variables are set in Vercel dashboard');
console.log('2. Redeploy after adding missing environment variables');
console.log('3. Check Vercel function logs for specific error details');
console.log('4. Test the debug endpoint after deployment');