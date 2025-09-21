# Environment Configuration

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Backend API Configuration
# IMPORTANT: Use HTTPS URL for production to avoid mixed content errors
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com:8000/create_story/

# Authentication Secret Key
# IMPORTANT: Generate a strong, random secret for production!
# Generate with: openssl rand -hex 32
AUTH_SECRET=your-super-secret-key-change-this-in-production
```

## For Vercel Deployment

Add these environment variables in your Vercel dashboard:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `NEXT_PUBLIC_BACKEND_URL`: Your HTTPS backend URL
   - `AUTH_SECRET`: A secure random string

## Mixed Content Error Fix

If you're getting "blocked:mixed-content" errors, ensure your backend URL uses HTTPS, not HTTP. This is required when your frontend is hosted on HTTPS (like Vercel).

### Quick Fix Options:

1. **Update backend to use HTTPS** (recommended)
2. **Use a proxy service** like ngrok to create HTTPS tunnel
3. **Deploy backend with SSL certificate**

### Current Backend URL Issue:
- ❌ `http://34.61.191.253:8000` (HTTP - blocked by browsers)
- ✅ `https://34.61.191.253:8000` (HTTPS - required for production)
