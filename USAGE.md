# Authentication Test Scripts - Usage Guide

## Quick Start

To quickly test if the authentication cookie issue is fixed:

```bash
# Quick test (recommended first step)
node quick-auth-test.js

# Full test suite
node run-auth-tests.js
```

## Available Scripts

| Script | Purpose | Time | Use When |
|--------|---------|------|----------|
| `quick-auth-test.js` | Quick verification | ~10 seconds | First check, CI/CD |
| `test-middleware-cookies.js` | Middleware behavior | ~15 seconds | Debugging middleware |
| `test-login-cookies.js` | Login flow | ~20 seconds | Debugging login |
| `test-auth-cookies.js` | Comprehensive test | ~30 seconds | Full verification |
| `run-auth-tests.js` | All tests | ~60 seconds | Complete validation |

## Environment Setup

Make sure your app is running:

```bash
# Start your Next.js app
npm run dev
# or
yarn dev
```

## Test Results Interpretation

### ✅ All Green
```
🎉 QUICK TEST PASSED!
The authentication system appears to be working correctly.
```
**Meaning**: The cookie issue is FIXED! 🎉

### ❌ Red Errors
```
❌ Login endpoint does not set any cookies
❌ Missing required auth cookies
```
**Meaning**: The cookie issue is NOT fixed. Check the specific errors.

### ⚠️ Yellow Warnings
```
⚠️ Debug endpoint status: 404
```
**Meaning**: Some features may not be working, but core auth is OK.

## Common Issues & Solutions

### Issue: "Login endpoint failed: 500"
**Solution**: Check if your app is running and database is connected.

### Issue: "No cookies were set by the login endpoint"
**Solution**: Check if `setAuthCookies` is being called in the login route.

### Issue: "Missing required auth cookies"
**Solution**: Verify cookie names match between setting and reading.

### Issue: "Connection refused"
**Solution**: Make sure your app is running on the correct port.

## Custom Configuration

```bash
# Test against production
BASE_URL="https://your-app.vercel.app" node quick-auth-test.js

# Test with different credentials
TEST_EMAIL="your@email.edu" TEST_PHONE="+1234567890" node test-login-cookies.js
```

## Integration with CI/CD

Add to your GitHub Actions or CI pipeline:

```yaml
- name: Test Authentication
  run: node quick-auth-test.js
  env:
    BASE_URL: ${{ secrets.APP_URL }}
```

## Next Steps After Testing

1. **If tests pass**: Deploy and test in production
2. **If tests fail**: Fix the specific issues identified
3. **If unsure**: Run the full test suite for detailed analysis

## Getting Help

If tests are failing:

1. Check the detailed error messages
2. Verify your app is running correctly
3. Check browser developer tools for cookie issues
4. Review the middleware and auth route implementations

