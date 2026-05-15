// src/components/PwaManager.jsx
import { useEffect, useState } from 'react';

const PUBLIC_VAPID_KEY = 'YOUR_PUBLIC_VAPID_KEY'; // Generate with web-push

export default function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  // 1. Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.error('SW failed:', err));
    }
  }, []);

  // 2. Listen for beforeinstallprompt (PWA install)
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') console.log('User installed PWA');
      setDeferredPrompt(null);
      setShowInstall(false);
    });
  };

  // 3. Request notification permission & subscribe
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      subscribeToPush();
    } else {
      console.warn('Notification denied');
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      // Send subscription to your backend (store in database for the user)
      await fetch('/api/save-push-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      console.log('Push subscription saved');
    } catch (err) {
      console.error('Push subscription error:', err);
    }
  };

  // Helper to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {showInstall && (
        <button onClick={handleInstallClick} style={{ background: '#1976d2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 30, marginRight: 10 }}>
          📲 Install App
        </button>
      )}
      <button onClick={requestNotificationPermission} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 30 }}>
        🔔 Enable Notifications
      </button>
    </div>
  );
}