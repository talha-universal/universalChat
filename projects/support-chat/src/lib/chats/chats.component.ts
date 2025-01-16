import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ChatBoxComponent } from '../chat-box/chat-box.component';
import { ChatsIconComponent } from '../chats-icon/chats-icon.component';

@Component({
  selector: 'lib-chats',
  standalone: true,
  imports: [ChatBoxComponent,ChatsIconComponent,NgIf],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.css'
})
export class LibChatsComponent {
  isChatBoxOpen = false;

  toggleChatBox() {
    this.isChatBoxOpen = !this.isChatBoxOpen;
  }
}
