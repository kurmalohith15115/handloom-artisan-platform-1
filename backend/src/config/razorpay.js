const Razorpay = require('razorpay');
require('dotenv').config();

const keyId = process.env.RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

// Mock payment mode if explicitly configured or if key parameters are empty
const isMockMode = process.env.MOCK_PAYMENT === 'true' || !keyId || !keySecret;

let razorpayInstance = null;

if (!isMockMode) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('[Razorpay] Active in LIVE/TEST integration mode.');
  } catch (err) {
    console.log('[Razorpay] Error initializing, falling back to MOCK mode:', err.message);
  }
} else {
  console.log('[Razorpay] Active in MOCK/SANDBOX simulator mode. (No keys supplied)');
}

module.exports = {
  razorpayInstance,
  isMockMode,
  keyId
};
