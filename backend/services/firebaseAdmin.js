require('dotenv').config();
const admin = require('firebase-admin');

function getServiceAccountFromEnv() {
  if (process.env.FIREBASE_CONFIG) {
    try {
      const config = JSON.parse(process.env.FIREBASE_CONFIG);
      if (config.private_key) {
        config.private_key = config.private_key.replace(/\\n/g, '\n');
      }
      return config;
    } catch (error) {
      console.warn('Failed to parse FIREBASE_CONFIG:', error.message);
      return null;
    }
  }

  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_ID,
    FIREBASE_CLIENT_ID,
  } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    return null;
  }

  const clientEmail = FIREBASE_CLIENT_EMAIL;
  const encodedEmail = encodeURIComponent(clientEmail);

  return {
    type: 'service_account',
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: clientEmail,
    client_id: FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodedEmail}`,
    universe_domain: 'googleapis.com',
  };
}

const serviceAccount = getServiceAccountFromEnv();

try {
  if (!serviceAccount) {
    throw new Error(
      'Firebase credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env (or FIREBASE_CONFIG).'
    );
  }

  admin.initializeApp({
    credential: admin.cert(serviceAccount),
  });
  console.log('Firebase Admin Initialized');
} catch (error) {
  console.warn('Failed to initialize Firebase Admin SDK. Did you provide valid credentials?');
  console.error(error.message);
}

async function sendPushNotification(tokens, payload) {
  try {
    if (!tokens || tokens.length === 0) {
      console.log('No FCM tokens provided, skipping push notification');
      return null;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent: ${response.successCount} messages`);
    console.log(`Failed: ${response.failureCount} messages`);

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

module.exports = { sendPushNotification, admin };
