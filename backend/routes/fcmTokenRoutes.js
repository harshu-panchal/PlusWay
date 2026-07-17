const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Save FCM Token
// Expects in body: { token: string, platform: 'web' | 'app' }
router.post('/save', protect, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const user = req.user;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    if (!['web', 'app'].includes(platform)) {
      return res.status(400).json({ error: 'Platform must be "web" or "app"' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (platform === 'web') {
      if (!user.fcmTokens) user.fcmTokens = [];
      if (!user.fcmTokens.includes(token)) {
        user.fcmTokens.push(token);
        if (user.fcmTokens.length > 10) {
          user.fcmTokens = user.fcmTokens.slice(-10);
        }
      }
    } else if (platform === 'app') {
      if (!user.fcmTokenMobile) user.fcmTokenMobile = [];
      if (!user.fcmTokenMobile.includes(token)) {
        user.fcmTokenMobile.push(token);
        if (user.fcmTokenMobile.length > 10) {
          user.fcmTokenMobile = user.fcmTokenMobile.slice(-10);
        }
      }
    }

    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save token' });
  }
});

// Remove FCM Token
router.post('/remove', protect, async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const user = req.user;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    if (!['web', 'app'].includes(platform)) {
      return res.status(400).json({ error: 'Platform must be "web" or "app"' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (platform === 'web' && user.fcmTokens) {
      user.fcmTokens = user.fcmTokens.filter(t => t !== token);
    } else if (platform === 'app' && user.fcmTokenMobile) {
      user.fcmTokenMobile = user.fcmTokenMobile.filter(t => t !== token);
    }

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'FCM token removed' });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ error: 'Failed to remove token' });
  }
});

module.exports = router;
