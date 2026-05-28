require('dotenv').config();

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

console.log('=== Firebase Credentials Check ===');
console.log('Service Account exists:', !!serviceAccount);
console.log('Length:', serviceAccount ? serviceAccount.length : 0);

if (serviceAccount) {
  try {
    const parsed = JSON.parse(serviceAccount);
    console.log('✓ Valid JSON');
    console.log('✓ Project ID:', parsed.project_id);
    console.log('✓ Client Email:', parsed.client_email);
    console.log('✓ Has Private Key:', !!parsed.private_key);
  } catch (e) {
    console.log('✗ JSON Parse Error:', e.message);
    console.log('\nFirst 100 chars:', serviceAccount.substring(0, 100));
  }
} else {
  console.log('✗ FIREBASE_SERVICE_ACCOUNT not found in .env');
}
