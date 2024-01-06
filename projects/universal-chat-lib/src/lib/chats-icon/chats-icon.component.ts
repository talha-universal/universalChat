import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lib-chats-icon',
  standalone: true,
  imports: [],
  templateUrl: './chats-icon.component.html',
  styleUrl: './chats-icon.component.css'
})
export class ChatsIconComponent {
  @Output() chatBoxToggle = new EventEmitter<void>();

  toggleChatBox() {
    this.chatBoxToggle.emit();
  }

}
