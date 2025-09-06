#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Supabase database...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

// Read current .env file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check if SUPABASE_URL exists
const supabaseUrlMatch = envContent.match(/SUPABASE_URL="([^"]+)"/);
if (!supabaseUrlMatch) {
  console.error('❌ SUPABASE_URL not found in .env file!');
  console.log('Please add your Supabase URL to the .env file first.');
  process.exit(1);
}

const supabaseUrl = supabaseUrlMatch[1];
console.log('✅ Found Supabase URL:', supabaseUrl.replace(/\/\/.*@/, '//***@'));

// Extract project reference from Supabase URL
const projectRefMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!projectRefMatch) {
  console.error('❌ Invalid Supabase URL format!');
  process.exit(1);
}

const projectRef = projectRefMatch[1];
console.log('✅ Project reference:', projectRef);

// Prompt for database password
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Enter your Supabase database password: ', (password) => {
  if (!password.trim()) {
    console.error('❌ Password cannot be empty!');
    rl.close();
    process.exit(1);
  }

  // Construct the DATABASE_URL
  const databaseUrl = `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
  
  console.log('\n📝 Updating .env file...');
  
  // Update the .env file
  let newEnvContent = envContent;
  
  // Replace or add DATABASE_URL
  if (newEnvContent.includes('DATABASE_URL=')) {
    newEnvContent = newEnvContent.replace(
      /DATABASE_URL="[^"]*"/,
      `DATABASE_URL="${databaseUrl}"`
    );
  } else {
    newEnvContent = `DATABASE_URL="${databaseUrl}"\n` + newEnvContent;
  }
  
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ Updated DATABASE_URL in .env file');
  
  console.log('\n🔄 Generating Prisma client...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
  } catch (error) {
    console.error('❌ Failed to generate Prisma client:', error.message);
    rl.close();
    process.exit(1);
  }
  
  console.log('\n📤 Pushing schema to Supabase...');
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('\n🎉 Database schema successfully pushed to Supabase!');
    console.log('\n📊 You can view your database at:');
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/editor`);
    console.log('\n🔍 To explore your data with Prisma Studio, run:');
    console.log('   npx prisma studio');
  } catch (error) {
    console.error('❌ Failed to push schema:', error.message);
    console.log('\n💡 Make sure your database password is correct and try again.');
  }
  
  rl.close();
});