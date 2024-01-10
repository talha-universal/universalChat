import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG } from '../../Config';
import { NetworkService } from '../Serives/network.service';
import { WebsocketService } from '../Serives/websocket.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first } from 'rxjs';
declare var $: any; @Component({
  selector: 'lib-chat-box',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css'
})
export class ChatBoxComponent implements OnInit, OnDestroy {
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
  // private SocketBaseUrl = CONFIG.socketurl == '' ? 'wss://' + window.location.host + '/universecasino' : 'ws://10.10.0.22:8080';
  private SocketBaseUrl = 'wss://buzzmehi.com/socketChat/';
  loginData: any = '';
  sendMessageObj: any;
  isDesktop: boolean;
  isMobile: boolean;
  isKeyboardMbl: boolean = true;
  isMobileInfo: string;
  opnKeybord: boolean = false;
  isSendButtonClick: boolean = false;
  sendSocketstatus: any = 1;
  sendMessagesArray: any = [];
  isConnecting: any = false;
  SupporterStatus: any = "Offline";
  constructor(private backendService: NetworkService, private websocketService: WebsocketService,
    private devicedetector: DeviceDetectorService, private el: ElementRef) {
    this.getMessageFromSocket();

    const weblogin = localStorage.getItem('webLogin') as string | '';
    if (weblogin == '' || weblogin == null || weblogin == undefined) {
      this.guestUserLogin = false;
    } else {
      this.LoginGuestUser();
    }
    this.isDesktop = this.devicedetector.isDesktop();
    // Check if the current device is a mobile

    this.isMobile = this.devicedetector.isMobile();
    this.isDesktop = this.devicedetector.isDesktop();
    this.isMobileInfo = this.devicedetector.os;


  }
  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.websocketService.closeSocket();
    this.messages = [];
    document.body.style.overflowY = 'auto';
  }

  onInputChange() {
    this.isSendButtonVisible = this.messageText.length > 0;

    if (this.messageText.length > 0 && this.sendSocketstatus == 1) {
      this.sendSocketstatus = 0;
      const typingObj = {
        type: "action",
        action: "dirty",
        sender: this.userDetails?.user?.id,
        receiver: this.userDetails?.user?.support,
        flag: "yes"
      }
      this.websocketService.send(typingObj);
    }

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

        const date1 = new Date(this.userDetails?.user?.token?.expiresAt);
        const date2 = new Date();
        if (date1 <= date2) {

          this.backendService.getAllRecordsByPost(CONFIG.validateMe, { token: this.userDetails?.user?.token?.token }).pipe(first())
            .subscribe((res) => {

              if (res.status = 'success') {
                this.userDetails.data.user.token.token = res?.data?.token;
                this.userDetails.data.user.token.expiresAt = res?.data?.token;

                data.data = this.userDetails;
                // Convert the object to a JSON string
                var updatedObjectString = JSON.stringify(data);


                // Store the updated string back in local storage
                localStorage.setItem('webLogin', updatedObjectString);
              }
              else {
                localStorage.clear();
                this.guestUserLogin = false
              }


            });


        }

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
      this.showAnimation = true;
      this.messages.push(newMessage);
      // console.log(this.messages);
      // this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));
      this.messages = this.messages.sort((a: any, b: any) => a.sentAt - b.sentAt);


      // this.sendMessagesArray.push(this.sendMessageObj);

      // this.checkAndSendMessages()
      this.websocketService.addToSendQueue(this.sendMessageObj);
      // this.websocketService.send(this.sendMessageObj);

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

            const localDate = new Date(socketData.sentAt); // Creating a new Date object
            // console.log('UTC Date:', socketData.sentAt);
            // console.log('Local Date:', localDate.toLocaleString());
            // socketData.sentAt = localDate;
            this.messages.push(socketData);
            // console.log(socketData);

            // Assuming the messages array remains sorted, if not, you may need to sort it.
            this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));
            // this.messages = this.messages.sort((a: any, b: any) => a.sentAt.toLocaleString() - b.sentAt.toLocaleString());
          }

        }
        if (socketData?.type == "all_user_status") {
          this.backendService.getSupporterStatusByGet(CONFIG.getUserStatus, this.userDetails?.user?.support).pipe(first())
            .subscribe((res: any) => {
              if (res.status == "success") {
                this.SupporterStatus = res?.data?.status
              }

            });
        }

      }

    })
  }

  onfocusText() {
    this.isKeyboardMbl = false;
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
      // checkBoxElement.style.top = `0`;
      // checkBoxElement.scrollTo({ top:0, behavior: 'smooth' });
      // checkBoxElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

      // marketScrollElement.style.marginTop = `${margintop}px`;
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    // Call your onBlurText() method or perform any other functionality
    // console.log("He Call me Scrol")

    if (this.opnKeybord) {
      // Call your onBlurText() method or perform any other functionality
      // this.onBlurText();
    } else {
      // Prevent default scroll behavior when the text box is focused
      // console.log("hhh");
      event.stopPropagation();
      event.preventDefault();
      document.body.style.overflow = 'hidden';
    }
    // this.onBlurText();
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

      const typingObj = {
        type: "action",
        action: "dirty",
        sender: this.userDetails?.user?.id,
        receiver: this.userDetails?.user?.support,
        flag: "no"
      }
      this.sendSocketstatus = 1;
      this.websocketService.send(typingObj);
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
