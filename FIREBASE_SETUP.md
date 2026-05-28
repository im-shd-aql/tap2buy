# Firebase Phone Authentication Setup Guide

## Overview
Firebase Phone Auth implementation for Tap2Buy - FREE for up to 10,000 verifications/month!

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `tap2buy` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create Project"

## Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click on **Phone** provider
3. Click **Enable** toggle
4. Click **Save**

## Step 3: Get Firebase Configuration

### For Web App (Client-side)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app with nickname: `tap2buy-web`
5. Copy the `firebaseConfig` object

Add these to `/Users/shahid/tap2buy/web/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tap2buy-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tap2buy-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tap2buy-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

### For API (Server-side)

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Click **Generate Key** (downloads JSON file)
4. Copy the entire JSON file content

Add to `/Users/shahid/tap2buy/api/.env`:

```env
# Firebase Admin SDK - Paste entire service account JSON as one line
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"tap2buy-xxxxx",...}
```

**Important:** Make sure to copy the ENTIRE JSON content and put it in one line (or use proper escaping).

Alternative method (if one-line doesn't work):
1. Save the downloaded JSON file as `firebase-service-account.json` in `/Users/shahid/tap2buy/api/`
2. Update `/Users/shahid/tap2buy/api/src/config/firebase.ts` to read from file instead

## Step 4: Configure Domain for Production

### Add Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Under **Authorized domains**, add:
   - `localhost` (for development)
   - Your production domain (e.g., `tap2buy.lk`)
   - Your web app domain (e.g., `app.tap2buy.lk`)

## Step 5: Test the Implementation

### Development Mode

For development/testing, you can keep using mock mode:

```env
# In api/.env
OTP_MODE=mock
```

This will skip Firebase and use the hardcoded OTP: `123456`

### Production Mode

When ready for production:

```env
# In api/.env
OTP_MODE=production
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

## Step 6: Verify Setup

1. Start the API server:
   ```bash
   cd /Users/shahid/tap2buy/api
   npm run dev
   ```

2. Start the web app:
   ```bash
   cd /Users/shahid/tap2buy/web
   npm run dev
   ```

3. Go to `http://localhost:3001/auth/login`
4. Enter a phone number (format: `0771234567`)
5. You should receive an SMS with OTP code
6. Enter the code and verify

## Pricing & Limits

- **Free Tier:** 10,000 verifications/month
- **After Free Tier:** $0.06 per verification (~LKR 18)
- **Your Estimate:** 500 sellers × 2 logins/week = ~4,000/month = **FREE**

## Troubleshooting

### "Firebase not initialized" error
- Make sure `FIREBASE_SERVICE_ACCOUNT` is set in `api/.env`
- Verify the JSON is valid (use a JSON validator)

### "Invalid phone number" error
- Phone must be in format: `0XXXXXXXXX` (10 digits)
- Will be converted to `+94XXXXXXXXX` for Firebase

### reCAPTCHA not appearing
- Check that Firebase domain is authorized
- Clear browser cache
- Check browser console for errors

### SMS not received
- Verify Phone Auth is enabled in Firebase Console
- Check that phone number is valid Sri Lankan number
- Some numbers may be blocked by carriers

## Security Notes

1. **Never commit** service account JSON to git
2. Add to `.gitignore`:
   ```
   firebase-service-account.json
   .env
   .env.local
   ```

3. Keep API keys secret
4. Use environment variables for all credentials
5. Rotate service account keys periodically

## Support

If you encounter issues:
1. Check Firebase Console → Authentication → Usage tab
2. Check API logs for Firebase errors
3. Verify all environment variables are set correctly
4. Test with mock mode first (`OTP_MODE=mock`)
