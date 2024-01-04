import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-chat-box',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css'
})
export class ChatBoxComponent {
  messageText: any;
  @Output() chatBoxClose = new EventEmitter<void>();
  @Input() isVisible = false;

  @ViewChild('collapseElement', { static: false }) collapseElement!: ElementRef;
  isSendButtonVisible: boolean = false;

  userName: string = '';
  
  onInputChange() {
    this.isSendButtonVisible = this.messageText.length > 0;
  }

  CloseChatBox() {
    this.isVisible = false
    this.chatBoxClose.emit();
  }



  startChat() {
    if (this.userName) {
      console.log(`Starting chat with ${this.userName}`);
      // Add your logic to start the chat here
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    const collapseNativeElement = this.collapseElement.nativeElement;
    console.log("call me ")
    // Check if the clicked element is outside the collapse and if the collapse is currently shown
    if (!collapseNativeElement.contains(targetElement) && collapseNativeElement.classList.contains('show')) {

      collapseNativeElement.classList.remove('show');
      // do something...
      console.log("call me here")
    }
  }
}
