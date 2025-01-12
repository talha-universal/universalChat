import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
// import { LibChatsComponent } from './../../projects/support-chat/src/public-api';
import { LibChatsComponent } from 'support-chat';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LibChatsComponent],
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
