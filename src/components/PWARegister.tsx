'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.NEXT_PUBLIC_SW_ENABLED !== 'true'
    ) {
      return;
    }

    let refreshing = false;

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered');

        // Optional: check update when tab gains focus
        window.addEventListener('focus', () => {
          registration.update();
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed', error);
      });

    // Reload page when a new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return () => {
      window.removeEventListener('focus', () => {});
    };
  }, []);

  return null;
}
