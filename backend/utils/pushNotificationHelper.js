const { sendPushNotification } = require('../services/firebaseAdmin');
const Customer = require('../models/Customer');
const Admin = require('../models/Admin');
const DeliveryBoy = require('../models/DeliveryBoy');

async function sendNotificationToUser(userId, userType, payload, includeMobile = true) {
  try {
    let user;
    if (userType === 'customer') {
      user = await Customer.findById(userId);
    } else if (userType === 'admin') {
      user = await Admin.findById(userId);
    } else if (userType === 'deliveryBoy') {
      user = await DeliveryBoy.findById(userId);
    }
    
    if (!user) {
      console.log(`User not found: ${userId} (${userType})`);
      return;
    }
    
    // Collect tokens
    let tokens = [];
    if (user.fcmTokens && user.fcmTokens.length > 0) {
      tokens = [...tokens, ...user.fcmTokens];
    }
    if (includeMobile && user.fcmTokenMobile && user.fcmTokenMobile.length > 0) {
      tokens = [...tokens, ...user.fcmTokenMobile];
    }
    
    // Remove duplicates
    const uniqueTokens = [...new Set(tokens)];
    
    if (uniqueTokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      return;
    }
    
    // Send notification
    await sendPushNotification(uniqueTokens, payload);
  } catch (error) {
    console.error('Error sending notification via helper:', error);
  }
}

module.exports = { sendNotificationToUser };
