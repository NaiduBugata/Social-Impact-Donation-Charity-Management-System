# ⚡ Vercel Deployment - Quick Reference

## 🎯 Environment Variables (Add in Vercel Dashboard)

```env
VITE_API_BASE=https://donation-backend-iedk.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_RcsavZB6Xb9MD7
VITE_NODE_ENV=production
```

## 🚀 Deploy Steps

### 1️⃣ Push Code to GitHub
```powershell
git add .
git commit -m "ready for deployment"
git push origin master
```

### 2️⃣ Configure Vercel
1. Go to https://vercel.com/dashboard
2. Import project: `Social-Impact-Donation-Charity-Management-System`
3. Settings → Environment Variables → Add the 3 variables above
4. Select "Production" for each variable

### 3️⃣ Deploy
- Vercel auto-deploys on push to master
- Or manually: Deployments → ... → Redeploy

### 4️⃣ Update Backend CORS
Add your Vercel URL to backend's allowed origins in `backend/src/app.js`:
```javascript
const allowedOrigins = [
  'https://your-vercel-url.vercel.app', // Add this
  // ... other origins
];
```

## ✅ Verify Deployment

1. **Check Build Logs**: Vercel Dashboard → Deployments → Click deployment
2. **Test Site**: Visit your Vercel URL
3. **Test API**: Check Network tab - calls should reach Render backend
4. **Test Payment**: Try anonymous donation - Razorpay modal should open

## 🐛 Quick Fixes

**Env vars undefined?**
→ Redeploy without build cache

**CORS errors?**
→ Add Vercel domain to backend's allowedOrigins

**Build fails?**
→ Check Vercel logs, verify `frontend/package.json` has `build` script

**Payment fails?**
→ Verify `VITE_RAZORPAY_KEY_ID` is correct

## 📞 Full Guide
See `VERCEL_DEPLOYMENT_GUIDE.md` for complete documentation
