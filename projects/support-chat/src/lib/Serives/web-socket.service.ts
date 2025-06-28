import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { BASE_URL_WS } from '../../Config';
import { NotificationService } from './notification.service';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: Socket | undefined;

  constructor(private notificationService: NotificationService) {

  }
  connect(token?: string): void {
    this.socket = io(BASE_URL_WS
      //   , {
      //     transports: ['websocket'],
      //     path: '/csp-chat/',  // Specify the correct path for WebSocket namespace
      //     query: { token },  // Pass token and project ID
      // }
    );


    this.notificationService.initFirebase({
      apiKey: 'AIzaSyAZquFuAauHVLepUosYgrnD8cKzHGhD4dI',
      authDomain: 'chat-83494.firebaseapp.com',
      projectId: 'chat-83494',
      storageBucket: 'chat-83494.firebasestorage.app',
      messagingSenderId: '124771750685',
      appId: '1:124771750685:web:00cc42a2ad5408c9a087f4'
    });

    // Start listening for FCM messages
    this.notificationService.listenForMessages();
    console.log(' Start listening for FCM messages')

    // Reset badge when chat opens
    this.notificationService.resetBadge();


    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }
  sendMessage(eventName: string, message: any) {
    if (this.socket) {
      this.socket.emit(eventName, message);
    }
  }

  onEvent(eventName: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  listen(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
  listenForMessages(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.onAny((eventName: string, data: any) => {
          observer.next({ event: eventName, ...data });
        });
      }
    });
  }
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log("disconnect")
    }
  }

  closeChat() {
    // Close socket
    if (this.socket) this.socket.close();

    console.log("closeChat")
    // Badge persists until next open
  }

}
