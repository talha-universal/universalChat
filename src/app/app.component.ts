import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { LibChatsComponent } from './../../projects/support-chat/src/public-api';
// import { LibChatsComponent } from 'support-chat';
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
  Math: any;

  toggleChatBox() {
    this.isChatBoxOpen = !this.isChatBoxOpen;
  }



}
