require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log('🔍 SendGrid Diagnostics');
console.log('='.repeat(60));
console.log('\n1️⃣ Environment Variables:');
console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set (length: ' + process.env.SENDGRID_API_KEY.length + ')' : '❌ Not set'}`);
console.log(`   MAIL_FROM: ${process.env.MAIL_FROM || '❌ Not set'}`);

console.log('\n2️⃣ API Key Format:');
if (process.env.SENDGRID_API_KEY) {
  const key = process.env.SENDGRID_API_KEY;
  console.log(`   Starts with 'SG.': ${key.startsWith('SG.') ? '✅ Yes' : '❌ No'}`);
  console.log(`   Contains dots: ${(key.match(/\./g) || []).length} (should be 2)`);
  console.log(`   First 10 chars: ${key.substring(0, 10)}`);
  console.log(`   Last 10 chars: ...${key.substring(key.length - 10)}`);
}

console.log('\n3️⃣ Testing SendGrid API Connection...');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: process.env.MAIL_FROM,
  from: process.env.MAIL_FROM,
  subject: 'SendGrid Test Email',
  text: 'This is a test email from the donation platform to verify SendGrid configuration.',
  html: '<strong>This is a test email from the donation platform to verify SendGrid configuration.</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('   ✅ SUCCESS: Test email sent!');
    console.log(`   Email sent to: ${process.env.MAIL_FROM}`);
    console.log('\n✅ SendGrid is configured correctly!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Check your inbox: ' + process.env.MAIL_FROM);
    console.log('   2. Check spam folder if not in inbox');
    console.log('   3. The donation email functionality is ready to use!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('   ❌ FAILED: Email sending failed');
    console.error('\n📋 Error Details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.response) {
      console.error(`   Response Status: ${error.response.statusCode}`);
      console.error(`   Response Body:`, JSON.stringify(error.response.body, null, 2));
    }

    console.log('\n🔧 Common Solutions:');
    console.log('   401 Unauthorized:');
    console.log('      - API key is invalid, expired, or revoked');
    console.log('      - Generate a new API key in SendGrid dashboard');
    console.log('      - Go to: https://app.sendgrid.com/settings/api_keys');
    console.log('\n   403 Forbidden:');
    console.log('      - Sender email not verified in SendGrid');
    console.log('      - Go to: https://app.sendgrid.com/settings/sender_auth');
    console.log('      - Verify the sender email: ' + process.env.MAIL_FROM);
    console.log('\n   Links:');
    console.log('      - SendGrid Dashboard: https://app.sendgrid.com/');
    console.log('      - API Keys: https://app.sendgrid.com/settings/api_keys');
    console.log('      - Sender Authentication: https://app.sendgrid.com/settings/sender_auth');
    
    process.exit(1);
  });
