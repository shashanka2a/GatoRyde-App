# Auth Issues Debug Guide

## Issues Found

### 1. ✅ Fixed: Twilio Environment Variable Mismatch
- **Problem**: `TwilioSMSProvider` was looking for `TWILIO_FROM_PHONE` but .env has `TWILIO_PHONE_NUMBER`
- **Fix**: Updated `lib/notifications/providers.ts` to use correct env var name

### 2. 🔍 Investigating: 500 Server Error on Login

**Possible Causes:**
1. **Database Connection Issues**
   - Supabase database might be unreachable
   - Connection string might be incorrect
   - Database might be paused/sleeping

2. **Missing Environment Variables**
   - All required vars seem present in .env
   - JWT secret is configured correctly

3. **Email Service Issues**
   - Gmail SMTP credentials might be invalid
   - SMTP settings might be incorrect

### 3. ⚠️ Browser Extension Error
- **Error**: "message channel closed before a response was received"
- **Cause**: This is typically from browser extensions (like password managers, ad blockers)
- **Solution**: This is not an app issue, users can ignore or disable problematic extensions

## Debugging Steps

### Test Database Connection
```bash
# Test if database is reachable
npx prisma db pull
```

### Test Email Service
```bash
# Check if SMTP credentials work
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'rydify.app@gmail.com',
    pass: 'pfccswpzyuxscdeh'
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

### Check Server Logs
- Look for specific error messages in the server console
- Check if Prisma client is connecting properly
- Verify JWT token generation

## Next Steps
1. Test the fixes made
2. Check server logs for specific error details
3. Test database connectivity
4. Verify email service configuration