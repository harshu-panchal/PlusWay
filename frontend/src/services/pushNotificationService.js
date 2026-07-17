import { messaging, getToken, onMessage } from '../firebase';
import axios from 'axios';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Register service worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers are not supported');
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      return true;
    } else {
      console.log('❌ Notification permission denied');
      return false;
    }
  }
  return false;
}

// Get FCM token
async function getFCMToken() {
  if (!messaging) return null;
  
  try {
    const registration = await registerServiceWorker();
    await registration.update(); // Update service worker
    
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (token) {
      console.log('✅ FCM Token obtained:', token);
      return token;
    } else {
      console.log('❌ No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
    // don't throw to not crash the app, just return null
    return null;
  }
}

// Register FCM token with backend
export async function registerFCMToken(forceUpdate = false) {
  try {
    // Check if already registered
    const savedToken = localStorage.getItem('fcm_token_web');
    if (savedToken && !forceUpdate) {
      console.log('FCM token already registered locally');
      return savedToken;
    }
    
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null; // Don't throw, just abort gracefully
    }
    
    // Get token
    const token = await getFCMToken();
    if (!token) {
      return null;
    }
    
    // Save to backend using axios instance
    // Assuming backend endpoint exists
    // The interceptor usually adds auth headers, so we just use normal axios
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/fcm-tokens/save`, {
      token,
      platform: 'web'
    }, { withCredentials: true });
    
    if (response.data?.success) {
      localStorage.setItem('fcm_token_web', token);
      console.log('✅ FCM token registered with backend');
      return token;
    }
  } catch (error) {
    console.error('❌ Error registering FCM token with backend:', error);
  }
}

// Setup foreground notification handler
export function setupForegroundNotificationHandler(handler) {
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.notification?.title || 'Notification', {
        body: payload.notification?.body,
        icon: payload.notification?.icon || '/favicon.ico',
        data: payload.data
      });
    }
    
    // Call custom handler
    if (handler) {
      handler(payload);
    }
  });
}

// Initialize push notifications
export async function initializePushNotifications() {
  try {
    await registerServiceWorker();
    // Setup foreground listening
    setupForegroundNotificationHandler((payload) => {
      // You can add generic handling here, like showing a toast
    });
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}
