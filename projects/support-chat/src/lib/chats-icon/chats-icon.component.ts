import { Component, EventEmitter, Output } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
declare var $ :any;
@Component({
  selector: 'lib-chats-icon',
  standalone: true,
  imports: [],
  templateUrl: './chats-icon.component.html',
  styleUrl: './chats-icon.component.css'
})
export class ChatsIconComponent {

  @Output() chatBoxToggle = new EventEmitter<void>();
  isDesktop: boolean;

  constructor(private devicedetector: DeviceDetectorService){
    
    this.isDesktop = this.devicedetector.isDesktop();
  }
  toggleChatBox() {
    this.chatBoxToggle.emit();
    if (!this.isDesktop) {
      document.documentElement.style.overflow = 'hidden';
    }
  }

}
