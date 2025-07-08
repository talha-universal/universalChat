import { Component, EventEmitter, Inject, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NotificationService } from '../Serives/notification.service';
import { isPlatformBrowser, NgIf } from '@angular/common';
declare var $: any;
@Component({
  selector: 'lib-chats-icon',
  standalone: true,
  imports: [NgIf],
  templateUrl: './chats-icon.component.html',
  styleUrl: './chats-icon.component.css'
})
export class ChatsIconComponent implements OnInit {
  trayDisabled = false;
  @Output() chatBoxToggle = new EventEmitter<void>();
  isDesktop: boolean;

  badgeCount = 3;
  showTrayMessage = false;
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const dismissed = localStorage.getItem('chatTrayDismissed');
      if (!dismissed) {
        this.triggerTrayMessage();
      } else {
        this.trayDisabled = true;
      }
    }
  }
  constructor(private devicedetector: DeviceDetectorService, private notificationService: NotificationService, @Inject(PLATFORM_ID) private platformId: any) {

    this.isDesktop = this.devicedetector.isDesktop();

    this.notificationService.badgeCount$.subscribe(count => {
      this.badgeCount = count;
    });
  }
  toggleChatBox() {
    this.chatBoxToggle.emit();
    if (!this.isDesktop) {
      document.documentElement.style.overflow = 'hidden';
    }

    if (isPlatformBrowser(this.platformId)) {
      // ✅ Always dismiss tray on first click
      if (!this.trayDisabled) {
        this.trayDisabled = true;
        localStorage.setItem('chatTrayDismissed', 'true');
        this.showTrayMessage = false; // hide immediately if it's showing
      }

      // 🔽 Add your chat toggle logic here
  
    }

    // your existing chat open/close logic
  }



  triggerTrayMessage() {
    let count = 0;

    const showMessage = () => {
      if (count >= 2 || this.trayDisabled) return;

      this.showTrayMessage = true;

      setTimeout(() => {
        this.showTrayMessage = false;
        count++;
        setTimeout(showMessage, 3000);
      }, 2000);
    };

    setTimeout(showMessage, 5000);
  }

}

