const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/paypalWebhookController');

// Webhook endpoint (Requires public URL like Ngrok for local testing)
router.post('/webhook', handleWebhook);

module.exports = router;
