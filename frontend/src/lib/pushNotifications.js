// Push Notification Service for SOVEH App
import { notificationAPI } from './api';

class PushNotificationService {
  constructor() {
    this.permission = 'default';
    this.supported = 'Notification' in window;
  }

  async init() {
    if (!this.supported) {
      console.log('Push notifications not supported');
      return false;
    }

    this.permission = Notification.permission;
    
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    if (this.permission === 'granted') {
      await this.registerServiceWorker();
      return true;
    }

    return false;
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        
        // Register with backend
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
          )
        });

        // Send subscription to backend
        await notificationAPI.register(JSON.stringify(subscription), 'web');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/logo192.png',
      vibrate: [200, 100, 200],
      tag: 'soveh-notification',
      requireInteraction: false,
      ...options
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Pre-built notification types
  async orderPlaced(orderNumber) {
    await this.showNotification('Order Placed! 🎉', {
      body: `Your order ${orderNumber} has been placed successfully. We'll notify you when it's on the way.`,
      tag: 'order-placed'
    });
  }

  async orderConfirmed(orderNumber) {
    await this.showNotification('Order Confirmed ✅', {
      body: `Great news! Your order ${orderNumber} has been confirmed by the seller.`,
      tag: 'order-confirmed'
    });
  }

  async outForDelivery(orderNumber, eta) {
    await this.showNotification('Out for Delivery 🚚', {
      body: `Your order ${orderNumber} is on the way! ETA: ${eta}`,
      tag: 'out-for-delivery',
      requireInteraction: true
    });
  }

  async delivered(orderNumber) {
    await this.showNotification('Order Delivered! 📦', {
      body: `Your order ${orderNumber} has been delivered. Thank you for shopping with SOVEH!`,
      tag: 'delivered'
    });
  }

  async newDeal(dealTitle) {
    await this.showNotification('New Deal Alert! 🔥', {
      body: dealTitle,
      tag: 'deal-alert'
    });
  }

  async creditUpdate(amount, type) {
    const title = type === 'credit' ? 'Credit Added! 💰' : 'Payment Due 📋';
    await this.showNotification(title, {
      body: type === 'credit' 
        ? `₹${amount} credit has been added to your account.`
        : `₹${amount} payment is due. Pay now to avoid late fees.`,
      tag: 'credit-update'
    });
  }
}

export const pushService = new PushNotificationService();

// Initialize on app load
export const initPushNotifications = async () => {
  const enabled = await pushService.init();
  console.log('Push notifications:', enabled ? 'enabled' : 'disabled');
  return enabled;
};
