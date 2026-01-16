import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

interface NotificationManagerProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ onPermissionChange }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // Show prompt if permission is default and user hasn't dismissed it
      const dismissed = localStorage.getItem('notification-prompt-dismissed');
      if (Notification.permission === 'default' && !dismissed) {
        setTimeout(() => setShowPrompt(true), 5000); // Show after 5 seconds
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知機能をサポートしていません');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);
      
      if (onPermissionChange) {
        onPermissionChange(result);
      }

      if (result === 'granted') {
        // Send welcome notification
        sendNotification(
          'HOGUSY通知が有効になりました',
          '予約の更新やメッセージをリアルタイムでお知らせします',
          '/'
        );
        
        // Subscribe to push notifications
        subscribeToPush();
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if push manager is available
      if (!('pushManager' in registration)) {
        console.warn('Push messaging is not supported');
        return;
      }

      // Get existing subscription or create new one
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Public VAPID key (you should generate your own)
        const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
      }

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(subscription)
      });

      console.log('✅ Push subscription successful');
    } catch (error) {
      console.error('Push subscription error:', error);
    }
  };

  const sendNotification = (title: string, body: string, url: string = '/') => {
    if (permission !== 'granted') return;

    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'hogusy-notification',
      data: { url },
      vibrate: [200, 100, 200]
    });
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  // Permission badge component
  const PermissionBadge = () => {
    if (permission === 'granted') {
      return (
        <div className="flex items-center gap-2 text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-xs font-bold">
          <Bell size={14} />
          <span>通知ON</span>
        </div>
      );
    } else if (permission === 'denied') {
      return (
        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-1 rounded-full text-xs font-bold">
          <BellOff size={14} />
          <span>通知OFF</span>
        </div>
      );
    }
    return null;
  };

  // Notification prompt banner
  if (showPrompt && permission === 'default') {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 p-6 z-50 animate-fade-in-up">
        <button
          onClick={dismissPrompt}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="閉じる"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell size={24} className="text-teal-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-black text-lg text-gray-900 mb-2">通知を受け取る</h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              予約の更新、メッセージ、特別なオファーをリアルタイムでお知らせします。
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={requestPermission}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition-all active:scale-95"
              >
                許可する
              </button>
              <button
                onClick={dismissPrompt}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-95"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <PermissionBadge />;
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

export default NotificationManager;

// Export utility functions for sending notifications from other components
export const sendBookingNotification = (bookingId: string, message: string) => {
  if (Notification.permission === 'granted') {
    new Notification('予約更新', {
      body: message,
      icon: '/icon-192.png',
      tag: `booking-${bookingId}`,
      data: { url: `/app/booking/${bookingId}` }
    });
  }
};

export const sendMessageNotification = (sendername: string, message: string, bookingId: string) => {
  if (Notification.permission === 'granted') {
    new Notification(`${sendername}からのメッセージ`, {
      body: message,
      icon: '/icon-192.png',
      tag: `message-${bookingId}`,
      data: { url: `/app/booking/${bookingId}/chat` }
    });
  }
};
