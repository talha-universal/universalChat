import { Component, EventEmitter, Output } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NotificationService } from '../Serives/notification.service';
import { NgIf } from '@angular/common';
declare var $ :any;
@Component({
  selector: 'lib-chats-icon',
  standalone: true,
  imports: [NgIf],
  templateUrl: './chats-icon.component.html',
  styleUrl: './chats-icon.component.css'
})
export class ChatsIconComponent {

  @Output() chatBoxToggle = new EventEmitter<void>();
  isDesktop: boolean;

  badgeCount = 3;

  constructor(private devicedetector: DeviceDetectorService,private notificationService: NotificationService){
    
    this.isDesktop = this.devicedetector.isDesktop();

    this.notificationService.badgeCount$.subscribe(count => {
      this.badgeCount = count;
      console.log( this.badgeCount+"icom")
    });
  }
  toggleChatBox() {
    this.chatBoxToggle.emit();
    if (!this.isDesktop) {
      document.documentElement.style.overflow = 'hidden';
    }
  }



}
