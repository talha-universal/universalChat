import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messaging:any;
  private _badgeCount = new BehaviorSubject<number>(0);
  badgeCount$ = this._badgeCount.asObservable();

  initFirebase(config: any): void {
    const app = initializeApp(config);
    this.messaging = getMessaging(app);
    this.registerServiceWorker();
  }

  private registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(registration => {
          console.log('Service Worker registered');
          this.requestPermission(registration);
        });
    }
  }

  private requestPermission(registration: ServiceWorkerRegistration): void {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        getToken(this.messaging, { 
          serviceWorkerRegistration: registration,
          vapidKey: 'BNWs0dy4MVFNVHg7wVDkKZE71BY0jeAw35LT5DaN1JunB9AGy9-8Yd-NCZIVyUJ_x1PaVPuL1kDBGcYUadlSOKY' // From Firebase Project Settings
        }).then(token => console.log('FCM Token:', token));
      }
    });
  }

  listenForMessages(): void {
    onMessage(this.messaging, (payload) => {
      this._badgeCount.next(this._badgeCount.value + 1);
      console.log(this._badgeCount)
      // Show notification if needed
      new Notification(payload?.notification?.title!, {
        body: payload?.notification?.body
      });
    });
  }

  resetBadge(): void {
    this._badgeCount.next(0);
  }
}
