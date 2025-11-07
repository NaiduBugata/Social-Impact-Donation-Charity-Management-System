# 🚀 Redeployment Checklist - Payment Routes Fix

## ✅ Git Status
**Branch**: master  
**Latest Commit**: `7965c4a` - "fix: Razorpay payment routes - receipt length and webhook raw body handling"  
**Push Status**: ✅ Successfully pushed to origin/master

---

## 📦 Changes Deployed

### Backend Files Modified:
1. ✅ `backend/src/app.js` - Webhook registered before body parser
2. ✅ `backend/src/controllers/paymentController.js` - Fixed receipt length (max 40 chars)
3. ✅ `backend/src/routes/paymentRoutes.js` - Removed duplicate webhook route

### New Files Added:
1. ✅ `backend/scripts/testPaymentRoutes.js` - Comprehensive test suite
2. ✅ `backend/PAYMENT_ROUTES_TEST_REPORT.md` - Full documentation

### Cleanup:
1. ✅ Removed `razor-pay/` reference folder (16 files deleted)

---

## 🔧 Render Deployment

### Backend (Render)
- **Service**: donation-backend-iedk
- **URL**: https://donation-backend-iedk.onrender.com
- **Trigger**: Auto-deploy on push to master ✅
- **Expected**: Deployment should start automatically within 1-2 minutes

**Monitor deployment**: https://dashboard.render.com

### Environment Variables Required:
```env
RAZORPAY_KEY_ID=rzp_test_RcsavZB6Xb9MD7
RAZORPAY_KEY_SECRET=Ok1FiGnoHTJkSRUSDK3bEfGc
RAZORPAY_WEBHOOK_SECRET=<your_webhook_secret>
MONGODB_URI=<your_mongodb_atlas_connection>
JWT_SECRET=<your_jwt_secret>
SENDGRID_API_KEY=<your_sendgrid_key>
NODE_ENV=production
```

---

## 🌐 Frontend (Vercel)

### Environment Variables to Verify:
```env
VITE_API_BASE=https://donation-backend-iedk.onrender.com
VITE_RAZORPAY_KEY_ID=rzp_test_RcsavZB6Xb9MD7
```

### Check Vercel Dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Navigate to: **Settings** → **Environment Variables**
4. Verify both variables are set for **Production**

**Note**: If you make changes to Vercel env vars, you need to redeploy:
- Go to **Deployments** tab
- Click "..." on latest deployment → **Redeploy**

---

## 🧪 Post-Deployment Testing

### Wait for Render Deployment
Check logs at: https://dashboard.render.com/web/<service-id>/logs

Look for:
```
✅ Server running on port 10000
✅ MongoDB connected
✅ Environment: production
```

### Run Test Suite
Once deployment completes (usually 2-5 minutes):

```powershell
cd backend
$env:BACKEND_URL="https://donation-backend-iedk.onrender.com"
$env:RAZORPAY_KEY_SECRET="Ok1FiGnoHTJkSRUSDK3bEfGc"
node scripts/testPaymentRoutes.js
```

**Expected Results**:
- ✅ Test 1: Create Anonymous Order - PASSED
- ✅ Test 7: Webhook Endpoint - PASSED (signature validation)
- ⚠️ Tests 2-6: Skipped (require auth tokens)

---

## 🔐 Razorpay Webhook Configuration

### After Deployment Completes:
1. Go to: https://dashboard.razorpay.com/app/webhooks
2. Click **"Add New Webhook"**
3. Configure:
   - **Webhook URL**: `https://donation-backend-iedk.onrender.com/api/payments/webhook`
   - **Secret**: Use your `RAZORPAY_WEBHOOK_SECRET` env variable value
   - **Events**: Select these:
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `order.paid`
4. Click **"Create Webhook"**

### Test Webhook:
Razorpay dashboard has a "Send Test Webhook" feature to verify configuration.

---

## 🎯 Frontend Testing

### Test Anonymous Donation Flow:
1. Open: https://donation-frontend-phi.vercel.app
2. Navigate to donation page
3. Check "Donate Anonymously"
4. Enter email and amount
5. Click "Proceed to Payment"
6. Should see Razorpay modal with test key

### Test Authenticated Donation:
1. Login to platform
2. Select campaign
3. Enter amount
4. Complete payment
5. Verify payment appears in history

---

## 🐛 Troubleshooting

### If Anonymous Order Creation Fails:
Check Render logs for:
```
receipt: the length must be no more than 40.
```
- **Fix applied**: Receipt now limited to 40 chars
- **Verify**: Deployment has latest code

### If Webhook Returns 404:
Check that:
1. Webhook route registered BEFORE body parser in `app.js`
2. Render deployment completed successfully
3. Route: `/api/payments/webhook` (not `/webhook`)

### If Signature Validation Fails:
Verify:
1. `RAZORPAY_KEY_SECRET` matches Razorpay dashboard
2. Frontend using correct `VITE_RAZORPAY_KEY_ID`
3. Webhook secret matches in both platforms

---

## 📊 Monitoring

### Key Metrics to Check:
- **Render**: Response times, error rates in dashboard
- **MongoDB Atlas**: Connection count, query performance
- **Razorpay Dashboard**: Payment success rate, webhook delivery

### Logs to Monitor:
```bash
# Render logs
https://dashboard.render.com/web/<service-id>/logs

# Look for:
"Creating anonymous Razorpay order with options:"
"Payment verified successfully"
"Webhook signature validated"
```

---

## ✨ Success Criteria

- ✅ Git pushed to master
- ⏳ Render deployment completes (wait 2-5 min)
- ⏳ Test script passes anonymo us order creation
- ⏳ Webhook returns proper signature validation error
- ⏳ Frontend can create test payment
- ⏳ Payment appears in MongoDB

---

## 🆘 Need Help?

### Common Issues:
1. **Deployment Stuck**: Check Render logs for build errors
2. **Test Fails**: Verify backend URL is accessible
3. **Payment Modal Won't Open**: Check browser console for Razorpay SDK errors
4. **Webhook Not Receiving**: Verify webhook URL in Razorpay dashboard

### Support Channels:
- **Render**: https://render.com/docs
- **Razorpay**: https://razorpay.com/docs/webhooks/
- **Test Report**: See `backend/PAYMENT_ROUTES_TEST_REPORT.md`

---

**Status**: ✅ Ready for deployment  
**Last Updated**: November 7, 2025  
**Next Action**: Monitor Render deployment logs
