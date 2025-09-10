# Authentication Cookie Test Scripts

This directory contains Node.js scripts to test and verify if the authentication cookie issue has been fixed.

## Problem Description

The middleware was detecting missing auth cookies and redirecting to login, even after successful authentication. The issue was that authentication cookies weren't being set properly after login.

## Test Scripts

### 1. `run-auth-tests.js` - Main Test Runner
Runs all authentication tests and provides a comprehensive report.

```bash
node run-auth-tests.js
```

### 2. `test-middleware-cookies.js` - Middleware Behavior Test
Tests the middleware's cookie detection behavior with various scenarios:
- Protected routes without cookies (should redirect)
- Protected routes with partial cookies (should redirect)
- Protected routes with complete cookies (should allow access)
- Public routes (should always allow access)
- API routes (should handle their own authentication)

```bash
node test-middleware-cookies.js
```

### 3. `test-login-cookies.js` - Login Flow Test
Tests the actual login flow to verify if cookies are being set:
- Attempts login via `/api/auth/login-otp`
- Checks if required cookies (`uid`, `eduVerified`) are set
- Tests protected route access with the cookies
- Tests API endpoint access with the cookies

```bash
node test-login-cookies.js
```

### 4. `test-auth-cookies.js` - Comprehensive Auth Test
Full end-to-end authentication flow test:
- Tests debug endpoint access
- Tests middleware redirect behavior
- Tests complete login flow
- Tests cookie setting and validation
- Tests protected route access
- Tests API endpoint access

```bash
node test-auth-cookies.js
```

## Configuration

### Environment Variables

You can customize the test behavior using environment variables:

```bash
# Base URL for the application (default: http://localhost:3000)
export BASE_URL="http://localhost:3000"

# Test email for login (default: test@university.edu)
export TEST_EMAIL="test@university.edu"

# Test phone for login (default: +1234567890)
export TEST_PHONE="+1234567890"
```

### Example Usage

```bash
# Run all tests
node run-auth-tests.js

# Run specific test
node test-middleware-cookies.js

# Run with custom configuration
BASE_URL="https://your-app.vercel.app" node test-login-cookies.js
```

## Expected Results

### ✅ All Tests Pass
If the authentication issue is fixed, you should see:
- Middleware correctly detects auth cookies
- Login flow sets required cookies (`uid`, `eduVerified`)
- Protected routes are accessible with valid cookies
- API endpoints work with authentication

### ❌ Tests Fail
If tests fail, check for:
- Login endpoint not setting cookies
- Missing required auth cookies
- Middleware not detecting cookies properly
- Cookie domain/path configuration issues

## Troubleshooting

### Common Issues

1. **No cookies set after login**
   - Check if `setAuthCookies` is being called in login routes
   - Verify cookie options (domain, path, secure, etc.)

2. **Middleware still redirecting with cookies**
   - Check if cookie names match between setting and reading
   - Verify middleware is reading the correct cookies

3. **Cookies not persisting**
   - Check browser security settings
   - Verify cookie domain configuration
   - Check for HTTPS requirements in production

### Debug Steps

1. Run the debug endpoint: `GET /api/_debug/auth-status`
2. Check browser developer tools for cookies
3. Verify cookie settings in network tab
4. Test with different browsers/devices

## Files Created

- `run-auth-tests.js` - Main test runner
- `test-middleware-cookies.js` - Middleware behavior tests
- `test-login-cookies.js` - Login flow tests
- `test-auth-cookies.js` - Comprehensive auth tests
- `AUTH_TEST_README.md` - This documentation

## Next Steps

After running the tests:

1. If all tests pass: The authentication issue is resolved! 🎉
2. If tests fail: Review the specific failures and fix the underlying issues
3. Test with a real browser to verify the fix works in practice
4. Deploy and test in production environment

