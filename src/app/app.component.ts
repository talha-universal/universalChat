import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LibChatsComponent } from 'support-chat';
// import { ChatBoxComponent } from './chat-box/chat-box.component';
// import { ChatComponent } from './chat/chat.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,LibChatsComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'UniversalChat';
  isChatBoxOpen = false;

  toggleChatBox() {
    this.isChatBoxOpen = !this.isChatBoxOpen;
  }
}
