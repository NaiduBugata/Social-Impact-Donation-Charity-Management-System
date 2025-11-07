# 🚀 Vercel Frontend Deployment Guide

## 📋 Prerequisites
- GitHub repository pushed to master
- Vercel account connected to GitHub
- Backend deployed on Render: https://donation-backend-iedk.onrender.com

---

## ⚙️ Environment Variables for Vercel

### Required Variables (Set in Vercel Dashboard)

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these for **Production** environment:

```env
VITE_API_BASE=https://donation-backend-iedk.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_RcsavZB6Xb9MD7
VITE_NODE_ENV=production
```

### Optional (if you have video server):
```env
VITE_VIDEO_SERVER=https://donation-backend-iedk.onrender.com
```

---

## 🔧 Vercel Configuration

### Current Setup (vercel.json):
```json
{
  "buildCommand": "cd frontend && npm run build",
  "installCommand": "cd frontend && npm ci || (cd frontend && npm install --legacy-peer-deps)",
  "outputDirectory": "frontend/dist",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This configuration:
- ✅ Builds from `frontend` subdirectory
- ✅ Uses `npm ci` with fallback to `npm install --legacy-peer-deps`
- ✅ Outputs to `frontend/dist`
- ✅ Handles SPA routing with rewrites

---

## 📦 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to: https://vercel.com/dashboard
   - Login with GitHub

2. **Import Project** (if not already imported)
   - Click **"Add New..."** → **"Project"**
   - Select repository: `Social-Impact-Donation-Charity-Management-System`
   - Click **"Import"**

3. **Configure Build Settings**
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave at root)
   - **Build Command**: Will use vercel.json config
   - **Output Directory**: Will use vercel.json config
   - Click **"Deploy"**

4. **Add Environment Variables**
   - Go to: **Settings** → **Environment Variables**
   - Add each variable from above
   - Select **"Production"** environment
   - Click **"Save"**

5. **Redeploy** (if variables were added after first deploy)
   - Go to: **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - Check **"Use existing Build Cache"**: NO (to ensure fresh build with env vars)

### Option 2: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project root
cd "C:\Users\Sarojini Naidu\Desktop\Online Donation and Charity Management System"

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or just preview deployment
vercel
```

**Note**: CLI deployment will prompt for environment variables if not set in dashboard.

---

## ✅ Verify Environment Variables

### Check Current Variables:
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Environment Variables**
3. Verify all three variables exist:
   - ✅ `VITE_API_BASE`
   - ✅ `VITE_RAZORPAY_KEY_ID`
   - ✅ `VITE_NODE_ENV`

### Test in Browser Console:
After deployment, open your Vercel URL and run in console:
```javascript
// These should NOT be undefined
console.log(import.meta.env.VITE_API_BASE)
console.log(import.meta.env.VITE_RAZORPAY_KEY_ID)
```

**Important**: If variables are `undefined`, you need to:
1. Check they're set for "Production" environment
2. Redeploy with **"Use existing Build Cache" = NO**

---

## 🔍 Deployment Checklist

### Before Deploying:
- ✅ Git changes committed and pushed to master
- ✅ Backend deployed and running on Render
- ✅ `vercel.json` exists at project root
- ✅ `frontend/package.json` has valid build script

### During Deployment:
- ✅ No build errors in Vercel logs
- ✅ Build completes successfully (check output)
- ✅ Environment variables loaded

### After Deployment:
- ✅ Site loads without errors
- ✅ API calls reach backend (check Network tab)
- ✅ Razorpay modal opens on payment
- ✅ CORS allows requests from Vercel domain

---

## 🐛 Troubleshooting

### Issue: "VITE_API_BASE is undefined"
**Solution**: 
1. Add env variable in Vercel Dashboard
2. Redeploy **without** build cache
3. Variables must start with `VITE_` prefix

### Issue: Build fails with "npm ERR! code ERESOLVE"
**Solution**: 
- Already handled by `--legacy-peer-deps` in vercel.json
- If persists, check `frontend/package.json` for conflicting dependencies

### Issue: "Failed to fetch" errors
**Solution**:
1. Check `VITE_API_BASE` points to: `https://donation-backend-iedk.onrender.com`
2. Verify backend is running (visit backend URL)
3. Check backend CORS allows your Vercel domain

### Issue: 404 on page refresh
**Solution**: 
- Already handled by rewrite rule in vercel.json
- Ensures all routes serve `index.html` for SPA routing

### Issue: Payment modal doesn't open
**Solution**:
1. Check `VITE_RAZORPAY_KEY_ID` is set correctly
2. Check browser console for Razorpay SDK errors
3. Verify key format: `rzp_test_` or `rzp_live_`

---

## 🔐 Backend CORS Configuration

### Ensure Backend Allows Your Vercel Domain

Check `backend/src/app.js` has your Vercel URL in allowed origins:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://donation-frontend-phi.vercel.app',
  'https://your-vercel-deployment.vercel.app', // Add your actual Vercel URL
  process.env.FRONTEND_URL
].filter(Boolean);
```

**Get your Vercel URL**:
- Vercel Dashboard → Your Project → **Domains** tab
- Copy the `.vercel.app` domain

**Update backend**:
1. Add your Vercel domain to `allowedOrigins`
2. Or set `FRONTEND_URL` env variable in Render
3. Redeploy backend

---

## 📊 Monitoring Deployment

### Vercel Build Logs:
1. Go to: **Deployments** tab
2. Click on the deployment
3. View **"Building"** logs
4. Check for errors in:
   - Installing dependencies
   - Running build command
   - Generating output

### Look for Success Messages:
```
✓ Downloading packages...
✓ Installing dependencies...
✓ Running "cd frontend && npm run build"
✓ Build completed
✓ Deployment ready
```

### Common Log Warnings (Safe to Ignore):
- Peer dependency warnings (handled by --legacy-peer-deps)
- Optional dependency messages
- Package deprecation notices

---

## 🎯 Test Deployment

### 1. Basic Functionality:
- ✅ Homepage loads
- ✅ Navigation works
- ✅ Images/assets load

### 2. API Integration:
- ✅ Can view campaigns
- ✅ Authentication works (login/register)
- ✅ Data loads from backend

### 3. Payment Flow:
- ✅ Donation page accessible
- ✅ Razorpay modal opens
- ✅ Can complete test payment
- ✅ QR code displays for anonymous

### Test Payment Details:
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push:
Vercel automatically deploys when you push to master:
```powershell
git add .
git commit -m "your changes"
git push origin master
```

Vercel will:
1. Detect the push
2. Start build process
3. Deploy if build succeeds
4. Update production URL

### Manual Redeploy:
If you need to redeploy without code changes (e.g., after env variable update):
1. Vercel Dashboard → Deployments
2. Click "..." on latest deployment
3. Click **"Redeploy"**
4. Uncheck **"Use existing Build Cache"** if env vars changed

---

## 📱 Custom Domain (Optional)

### Add Custom Domain:
1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning (automatic)

### Update Backend CORS:
After adding custom domain, update backend's `allowedOrigins` to include it.

---

## 📈 Performance Optimization

### Current Optimizations:
- ✅ Static asset caching (31536000s)
- ✅ Clean URLs
- ✅ Minified build output
- ✅ Code splitting (Vite default)

### Additional Tips:
- Use lazy loading for routes
- Optimize images before upload
- Enable Vercel Analytics (Settings → Analytics)
- Monitor Core Web Vitals

---

## 🆘 Getting Help

### Vercel Documentation:
- General: https://vercel.com/docs
- Environment Variables: https://vercel.com/docs/environment-variables
- Build Configuration: https://vercel.com/docs/build-step

### Check Build Logs:
All deployment details are in the Vercel dashboard under the specific deployment.

### Common Commands:
```powershell
# Check Vercel CLI version
vercel --version

# View project info
vercel inspect

# View deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls
```

---

## ✨ Quick Deploy Checklist

Before you click deploy:

- [ ] Git pushed to master
- [ ] Backend is running on Render
- [ ] Environment variables ready:
  - [ ] `VITE_API_BASE=https://donation-backend-iedk.onrender.com`
  - [ ] `VITE_RAZORPAY_KEY_ID=rzp_test_RcsavZB6Xb9MD7`
  - [ ] `VITE_NODE_ENV=production`
- [ ] `vercel.json` at project root
- [ ] `frontend/package.json` has `build` script

**Ready to Deploy!** 🚀

---

**Last Updated**: November 7, 2025  
**Vercel Config**: vercel.json (root directory)  
**Build Command**: `cd frontend && npm run build`  
**Output**: `frontend/dist`
