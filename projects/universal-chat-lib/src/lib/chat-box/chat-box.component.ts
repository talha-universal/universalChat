import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG } from './../Config';
import { NetworkService } from '../Serives/network.service';
import { WebsocketService } from '../Serives/websocket.service';

@Component({
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
  loginData: any ='';
  sendMessageObj: any;
  constructor(private backendService: NetworkService, private websocketService: WebsocketService) {
    this.getMessageFromSocket();
    this.LoginGuestUser();
  }
  ngOnDestroy(): void {
    this.websocketService.closeSocket();
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



  LoginGuestUser(userLoginObj?:any){
    this.backendService.recordsFromLocalStorage(CONFIG.userLogin,CONFIG.userLoginTime , userLoginObj).subscribe((data: any) => {
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
      else{
        this.guestUserLogin = false
      }

    });

  }

obj:any =
    {

      sender: {
          name: "as_7",
          email: "as_7@xyz.com",
          domain: "xyz.com",
      },
      receiver:{},
      attachments: [],
      message: "",
      messageId: "web_1704473158873",
      type: "message",
      myMessage:false,
      forward: false,
      delivered: false,
      deliveredToSender: false,
      sentAt: "2024-01-05T16:45:58.873Z",
  }
  

  sendMessage() {
    if (this.messageText.trim() !== '') {
      const current = new Date();
      this.sendMessageObj = {
        type: "message",
        receiver: this.userDetails?.user?.support,
        message: this.messageText,
        sentAt: new Date(),
        messageId: "web_" + current.getTime()
      }

    
      this.obj.messageId ="web_" + current.getTime();
      this.obj.message =this.messageText;
      this.obj.sentAt =current;
      this.obj.myMessage = true
      this.messages.push(this.obj);

      this.websocketService.send(this.sendMessageObj);
      this.messageText = '';
      // this.isSendButtonVisible = false
      const chatBox = document.getElementById('chatMessage')
      chatBox?.focus();
    }
    else {
      return
    }
  }

  getMessageFromSocket() {
    this.counter = 0;
    this.websocketService.getMarketData().subscribe((data: any) => {
      if (data !== "connected") {
        const socketData = JSON.parse(data)

        if (socketData?.type == "message") {


          const indexToUpdate = this.messages.findIndex((msg: any) => msg.messageId === socketData.messageId);

          // If the message with the same messageId is found, update it
          if (indexToUpdate !== -1) {
            this.showAnimation = false;
            this.messages[indexToUpdate] = socketData;
          } else {
            this.showAnimation = true;
            this.messages.push(socketData);
          }



        }
      }

    })
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
}