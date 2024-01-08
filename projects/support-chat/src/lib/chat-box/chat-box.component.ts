import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG } from '../../Config';
import { NetworkService } from '../Serives/network.service';
import { WebsocketService } from '../Serives/websocket.service';
import { DeviceDetectorService } from 'ngx-device-detector';
declare var $: any; @Component({
  selector: 'lib-chat-box',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css'
})
export class ChatBoxComponent implements OnDestroy {
  messageText: any;
  guestUserLogin: any = false;
  showAnimation = true;
  @Output() chatBoxClose = new EventEmitter<void>();
  @Input() isVisible = false;

  @ViewChild('collapseElement', { static: false }) collapseElement!: ElementRef;
  isSendButtonVisible: boolean = false;

  userName: string = '';
  chatUserName: any = '';
  messages: any = [];
  counter: number = 0;
  userDetails: any;
  // 'ws://185.182.194.244:8080'
  // private SocketBaseUrl = CONFIG.socketurl == '' ? 'wss://' + window.location.host + '/universecasino' : 'ws://185.182.194.244:8080';
  private SocketBaseUrl = 'wss://buzzmehi.com/socketChat/';
  loginData: any = '';
  sendMessageObj: any;
  isDesktop: boolean;
  isMobile: boolean;
  isKeyboardMbl: boolean = true;
  isMobileInfo: string;
  opnKeybord: boolean = false;
  isSendButtonClick: boolean = false;
  constructor(private backendService: NetworkService, private websocketService: WebsocketService,
    private devicedetector: DeviceDetectorService, private el: ElementRef) {
    this.getMessageFromSocket();
    this.LoginGuestUser();
    this.isDesktop = this.devicedetector.isDesktop();
    // Check if the current device is a mobile

    this.isMobile = this.devicedetector.isMobile();
    this.isDesktop = this.devicedetector.isDesktop();
    this.isMobileInfo = this.devicedetector.os;


  }
  ngOnDestroy(): void {
    this.websocketService.closeSocket();
    this.messages = [];
    document.body.style.overflowY = 'auto';
  }

  onInputChange() {
    this.isSendButtonVisible = this.messageText.length > 0;
  }

  CloseChatBox() {
    this.isVisible = false
    this.chatBoxClose.emit();
  }



  startChat() {
    if (this.userName) {
      // Add your logic to start the chat here
      const withOutLoginUser = {
        username: this.userName,
        role: "Guest",
        domain: "xyz.com"
      }
      this.LoginGuestUser(withOutLoginUser)


    }
  }



  LoginGuestUser(userLoginObj?: any) {
    this.backendService.recordsFromLocalStorage(CONFIG.userLogin, CONFIG.userLoginTime, userLoginObj).subscribe((data: any) => {
      if (data.status == 'success') {
        this.guestUserLogin = true
        this.userDetails = data?.data;
        this.chatUserName = data?.data?.user?.name;


        var url = this.SocketBaseUrl + '?token=' + this.userDetails?.user?.token?.token;
        // var url = this.SocketBaseUrl + '?token=' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJndWVzdEVtYWlsIjoidGFsaGExNzA0Mzc2NjYxQHh5ei5jb20iLCJpYXQiOjE3MDQzNzY2NjEsImV4cCI6MTcwNDQwNTQ2MX0.iP4ypSl6V7JC8bK2w_QLBPTLJtW31H5G-52FZf9UKm0';



        this.websocketService.connect(url).subscribe(
          async (message: any) => {
          },
          (error: any) => {
            console.error('WebSocket error:', error);
          },
          () => {
            console.log('WebSocket connection closed');
          }
        );
      }
      else {
        this.guestUserLogin = false
      }

    });

  }

  obj: any =
    {

      sender: {
        name: "as_7",
        email: "as_7@xyz.com",
        domain: "xyz.com",
        _id: "1223",
      },
      receiver: {},
      attachments: [],
      message: "",
      messageId: "web_1704473158873",
      type: "message",
      myMessage: false,
      forward: false,
      delivered: false,
      deliveredToSender: false,
      sentAt: "2024-01-05T16:45:58.873Z",
    }


  sendMessage() {
    this.isSendButtonClick = true;
    const chatBox = document.getElementById('chatMessage')
    chatBox?.focus();
    const formatDate = (date: Date): string => {
      return date.toISOString();
    };
    if (this.messageText.trim() !== '') {
      const current = new Date();
      this.sendMessageObj = {
        type: "message",
        receiver: this.userDetails?.user?.support,
        message: this.messageText,
        sentAt: new Date(),
        messageId: "web_" + current.getTime()
      }
  
      const newMessage = {
        ...this.obj,  // Copy properties from the original object if needed
        messageId: this.sendMessageObj.messageId,
        message: this.messageText,
        sentAt: formatDate(current),
        myMessage: true
      };
      
      this.messages.push(newMessage);
      this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));

      this.websocketService.send(this.sendMessageObj);
      this.messageText = '';
      // this.isSendButtonVisible = false

    }
    else {
      return
    }
  }

  binarySearch(messages: any, targetMessageId: any) {
    let left = 0;
    let right = messages.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (messages[mid].messageId === targetMessageId) {
        // Found the targetMessageId
        return mid; // Return the index of the matching object
      }

      if (messages[mid].messageId < targetMessageId) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // If targetMessageId is not found in any object
    return -1;
  }

  getMessageFromSocket() {
    this.counter = 0;
    this.websocketService.getMarketData().subscribe((data: any) => {
      if (data !== "connected") {
        const socketData = JSON.parse(data)

        if (socketData?.type == "message") {


          const index = this.binarySearch(this.messages, socketData.messageId);

          if (index !== -1) {
            // Do something with the found object, e.g., update it
            this.showAnimation = false;
            this.messages[index] = socketData;
          } else {
            // If the message with the same messageId is not found, add it to the array
            this.showAnimation = true;
            this.messages.push(socketData);

            // Assuming the messages array remains sorted, if not, you may need to sort it.
            this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));
          }


          // const indexToUpdate = this.messages.findIndex((msg: any) => msg.messageId === socketData.messageId);

          // // If the message with the same messageId is found, update it
          // if (indexToUpdate !== -1) {
          //   this.showAnimation = false;
          //   this.messages[indexToUpdate] = socketData;
          // } else {
          //   this.showAnimation = true;
          //   this.messages.push(socketData);
          //   this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));

          // }


        }
      }

    })
  }

  onfocusText() {
    this.isKeyboardMbl = false;
    debugger
    if (!this.opnKeybord && this.isMobile) {
      this.setMarketScrollHeight();
    }
  }

  setMarketScrollHeight() {
    this.opnKeybord = true
    const checkBoxElement = document.getElementById('checkBox');
    const windowHeight = window.innerHeight;
    // Adjust the percentage or calculation based on your specific needs.

    if (this.isMobile) {
      document.body.style.overflowY = 'hidden';
    }
    let targetHeight;
    if (windowHeight <= 720) {
      //  targetHeight = Math.floor(windowHeight * 0.52); //done
      targetHeight = Math.floor(windowHeight * 0.61);
    }
    else if (this.isMobileInfo == 'iOS') {
      targetHeight = Math.floor(windowHeight * 0.625);
    }
    else {
      targetHeight = Math.floor(windowHeight * 0.62);
    }

    if (checkBoxElement) {
      checkBoxElement.style.height = `${targetHeight}px`;
      // marketScrollElement.style.marginTop = `${margintop}px`;
    }
  }


  onBlurText(event: FocusEvent) {
    setTimeout(() => {
      const clickedElement = event.relatedTarget as HTMLElement;

      // Check if the click was on the "Send" button
      if (this.isSendButtonClick) {
        this.isSendButtonClick = false; // Reset the flag
        return;
        // Perform specific actions for "Send" button click during blur
      } else {
        this.isKeyboardMbl = true;
        const checkBoxElement = document.getElementById('checkBox');
        if (checkBoxElement && this.isMobile) {
          this.opnKeybord = false;
          checkBoxElement.style.height = `100%`;
        }
      }
    }, 300);

  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;
    const collapseNativeElement = this.collapseElement.nativeElement;
    // Check if the clicked element is outside the collapse and if the collapse is currently shown
    if (!collapseNativeElement.contains(targetElement) && collapseNativeElement.classList.contains('show')) {

      collapseNativeElement.classList.remove('show');
      // do something...
    }
  }
  // 
}
