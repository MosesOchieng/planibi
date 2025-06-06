export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    window.workbox !== undefined
  ) {
    const wb = window.workbox;

    // Add event listeners to handle PWA lifecycle
    addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        wb.skipWaiting();
      }
    });

    // Register the service worker after event listeners are added
    wb.register();
  }
}

export async function requestNotificationPermission() {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator
  ) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });
        return subscription;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }
  return null;
}

export async function sendPushNotification(subscription: PushSubscription, message: string) {
  try {
    const response = await fetch('/api/push-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
} 