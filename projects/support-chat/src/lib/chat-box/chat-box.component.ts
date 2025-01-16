import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG } from '../../Config';
import { NetworkService } from '../Serives/network.service';
import { WebsocketService } from '../Serives/websocket.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first } from 'rxjs';
import { IndexDBChatService } from '../Serives/index-dbchat.service';
import { SocketMessage } from '../Serives/message-interface';
import { MessageHandlingService } from '../Serives';
import { RecordingService } from '../Serives/recording.service';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any; @Component({
  selector: 'lib-chat-box',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css',
})
export class ChatBoxComponent implements OnInit, OnDestroy,AfterViewInit {
  messageText: any = '';
  guestUserLogin: any = false;
  showAnimation = true;
  @Output() chatBoxClose = new EventEmitter<void>();
  @Input() isVisible = false;
  visualizerCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('waveformCanvas', { static: true }) waveformCanvasRef!: ElementRef<HTMLCanvasElement>;
  

  @ViewChild('collapseElement', { static: false }) collapseElement!: ElementRef;
  isSendButtonVisible: boolean = false;
  audioRecording: any = false;

  userName: string = '';
  chatUserName: any = '';
  messages: any = [];
  counter: number = 0;
  userDetails: any;
  // 'ws://185.182.194.244:8080'
  private SocketBaseUrl = CONFIG.socketurl == '' ? 'wss://buzzmehi.com/socketChat/' : CONFIG.socketurl;
  // private SocketBaseUrl = 'wss://buzzmehi.com/socketChat/';
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
  uploadImgResponse: any;
  audioSrc: any;

  isRecording = false;
  dataArray: Uint8Array | undefined;
  private animationFrameId: number | undefined;

  private canvasVisible = false;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  blobAudio:any;
  // messages: SocketMessage[] = [];
  constructor(private backendService: NetworkService, private websocketService: WebsocketService,
    private indexedDBService: IndexDBChatService,
    private devicedetector: DeviceDetectorService,
    private recordingService: RecordingService,
    private sanitizer: DomSanitizer,
    private ngZone: NgZone,
    private messageHandlingService: MessageHandlingService, private el: ElementRef) {
    // this.getMessageFromSocket();
    this.messageHandlingService.getMessages().subscribe((message: any) => {
      // Handle incoming messages here
      this.handleIncomingMessage(message);
      // this.visualizerCanvasRef = new ElementRef<HTMLCanvasElement>(document.createElement('canvas'));
    });

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
    this.recordingService.getRecordingCompletedObservable().subscribe((blob :Blob) => {
      // this.playRecording(blob)
      this.blobAudio= blob
      console.log("blobAudio",this.blobAudio)
      this.audioSrc = URL.createObjectURL(blob);
      this.audioSrc = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
    });
    // this.startVisualization();
  }

  ngOnDestroy(): void {
    // this.stopAnimation();
    // this.stopRecording();
    this.websocketService.closeSocket();
    this.messages = [];
    document.body.style.overflowY = 'auto';
  }
  ngAfterViewInit(): void {
    this.toggleCanvasVisibility(false);


    // Start the animation loop after ngAfterViewInit
    // this.startAnimation();

  }

  private toggleCanvasVisibility(visible: boolean): void {
    if (this.waveformCanvasRef) {
      const canvasElement = this.waveformCanvasRef.nativeElement;
      canvasElement.style.display = visible ? 'block' : 'block';
      this.canvasVisible = visible;
    }
  }

  playRecording(): void {
    if (this.blobAudio) {
      // Create a URL for the Blob
      const blobUrl = URL.createObjectURL(this.blobAudio);

      // Create an <audio> element to play the recording
      const audio = new Audio(blobUrl);

      // Play the recording
      audio.play();
    } else {
      console.error('Recorded Blob is undefined or null. Make sure to set it before playing.');
    }
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
                this.userDetails.user.token.token = res?.data?.token;
                this.userDetails.user.token.expiresAt = res?.data?.token;

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
            },
              (error) => {
                // Error handling
                if (error?.data?.type == 99) {
                  // Handle 401 error specifically here
                  localStorage.clear();
                  this.guestUserLogin = false
                  // Redirect to login, clear local storage, or take other appropriate actions
                } else {
                  localStorage.clear();
                  this.guestUserLogin = false
                  console.error('An error occurred:', error);
                }
              }

            );

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


  // sendMessage() {
  //   this.isSendButtonClick = true;
  //   const chatBox = document.getElementById('chatMessage')
  //   chatBox?.focus();
  //   const formatDate = (date: Date): string => {
  //     return date.toISOString();
  //   };
  //   if (this.messageText.trim() !== '' && this.messageText !== undefined) {
  //     const current = new Date();
  //     this.sendMessageObj = {
  //       type: "message",
  //       receiver: this.userDetails?.user?.support,
  //       message: this.messageText,
  //       sentAt: new Date(),
  //       messageId: "web_" + current.getTime()
  //     }

  //     const newMessage = {
  //       ...this.obj,  // Copy properties from the original object if needed
  //       messageId: this.sendMessageObj.messageId,
  //       message: this.messageText,
  //       sentAt: formatDate(current),
  //       myMessage: true
  //     };
  //     this.showAnimation = true;
  //     this.messages.push(newMessage);
  //     // console.log(this.messages);
  //     // this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));
  //     this.messages = this.messages.sort((a: any, b: any) => a.sentAt - b.sentAt);


  //     // this.sendMessagesArray.push(this.sendMessageObj);

  //     // this.checkAndSendMessages()
  //     this.websocketService.addToSendQueue(this.sendMessageObj);
  //     // this.websocketService.send(this.sendMessageObj);

  //     this.messageText = '';
  //     // this.isSendButtonVisible = false

  //   }
  //   else if (this.uploadImgResponse.fileUrl !== '' || this.uploadImgResponse.fileUrl !== undefined) {
  //     this.uploadImgResponse.receiver = this.userDetails?.user?.support;

  //     const newMessage = {
  //       attachments:[{...this.uploadImgResponse}], // Copy properties from the original object if needed
  //       myMessage: true,
  //       message: '',
  //       sender:{
  //         email:this.userDetails?.user?.email
  //       },
  //       messageId: this.uploadImgResponse.messageId,
  //       sentAt: this.uploadImgResponse.sentAt
  //     };
  //     this.showAnimation = true;
  //     this.messages.push(newMessage);

  //     this.messages = this.messages.sort((a: any, b: any) => a.sentAt - b.sentAt);
  //     this.websocketService.addToSendQueue(this.uploadImgResponse);

  //     this.uploadImgResponse = {};
  //     console.log(this.messages);
  //   }

  //   else {
  //     return
  //   }
  // }

  sendMessage() {
    this.isSendButtonClick = true;
    const chatBox = document.getElementById('chatMessage');
    chatBox?.focus();
    const formatDate = (date: Date): string => {
      return date.toISOString();
    };
    if (this.messageText.trim() !== '' && this.messageText !== undefined) {
      const current = new Date();
      const sendMessageObj = {
        ...this.obj,
        type: "message",
        receiver: this.userDetails?.user?.support,
        message: this.messageText,
        sentAt: new Date(),
        messageId: "web_" + current.getTime()
      };

      // Send the message using MessageHandlingService
      this.messageHandlingService.sendMessage(sendMessageObj);
      const newMessage = {
        ...this.obj,
        messageId: sendMessageObj.messageId,
        message: this.messageText,
        sentAt: formatDate(current),
        myMessage: true
      };
      this.showAnimation = true;
      this.messages.push(newMessage);

      // Save the sent message to IndexedDB
      this.indexedDBService.addMessage(sendMessageObj);

      this.messageText = '';
    } else if (this.uploadImgResponse.fileUrl !== '' || this.uploadImgResponse.fileUrl !== undefined) {
      this.uploadImgResponse.receiver = this.userDetails?.user?.support;

      const newMessage = {
        attachments: [{ ...this.uploadImgResponse }], // Copy properties from the original object if needed
        myMessage: true,
        message: '',
        sender: {
          email: this.userDetails?.user?.email
        },
        messageId: this.uploadImgResponse.messageId,
        sentAt: this.uploadImgResponse.sentAt
      };
      this.showAnimation = true;

      this.messages.push(newMessage);

      this.messages = this.messages.sort((a: any, b: any) => a.sentAt - b.sentAt);
      // Send the file message using MessageHandlingService
      this.messageHandlingService.sendMessage(this.uploadImgResponse);
      this.uploadImgResponse = {};
    }
  }

  // Handle incoming messages
  private handleIncomingMessage(message: any): void {
    if (message.length !== 0) {

      const index = this.messages.findIndex((msg: any) => msg.messageId == message.messageId);

      setTimeout(() => {
        if (index !== -1) {
          // Do something with the found object, e.g., update it
          this.showAnimation = false;
          this.messages[index] = message;
        } else {
          // If the message with the same messageId is not found, add it to the array
          this.showAnimation = true;
          this.messages.push(message);

          // Assuming the messages array remains sorted, if not, you may need to sort it.
          this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));

          // Save the received message to IndexedDB
          this.indexedDBService.addMessage(message);
        }
      }, 900);

    }
    else {
      this.messages = []
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

          // const index = this.binarySearch(this.messages, socketData.messageId);
          const index = this.messages.findIndex((msg: any) => msg.messageId == socketData.messageId);

          setTimeout(() => {
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

              // Assuming the messages array remains sorted, if not, you may need to sort it.
              this.messages = this.messages.sort((a: any, b: any) => a.sentAt.localeCompare(b.sentAt));
              // this.messages = this.messages.sort((a: any, b: any) => a.sentAt.toLocaleString() - b.sentAt.toLocaleString());


              //Send Read status to other fellow
              if (this.userDetails?.user?.email !== socketData?.sender.email) {
                const isReadReceiverObj = {
                  type: "read_at",
                  sender: this.userDetails?.user?.support,
                  receiver: this.userDetails?.user?.id,
                  id: socketData._id,
                }
                this.websocketService.send(isReadReceiverObj);
              }
            }
          }, 900);


        }
        if (socketData?.type == "all_user_status") {
          this.backendService.getSupporterStatusByGet(CONFIG.getUserStatus, this.userDetails?.user?.support).pipe(first())
            .subscribe((res: any) => {
              if (res.status == "success") {
                this.SupporterStatus = res?.data?.status
              }

            });
        }
        if (socketData?.type == "action") {
          if (socketData.action == "dirty" && socketData.flag == 'yes') {
            this.SupporterStatus = 'typing...'
          }
          else if (socketData.action == "dirty" && socketData.flag == 'no') {
            this.SupporterStatus = 'Online'
          }
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

  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  @ViewChild('mediaInput') mediaInput: ElementRef | undefined;
  selectedFile: File | null = null;
  selectedFileType: string | null = null;

  openFileInput(fileType: string): void {
    this.selectedFileType = fileType;

    if (fileType === 'document' && this.fileInput) {
      this.fileInput.nativeElement.click();
    } else if (fileType === 'media' && this.mediaInput) {
      this.mediaInput.nativeElement.click();
    }
  }

  onFileSelected(event: any, typeFile: string): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const current = new Date();
      const timestamp = current.getTime();
      const fileObj = {
        file: this.selectedFile,
        attachmentId: timestamp
      }

      const fileName = this.selectedFile.name;
      const fileExtension = fileName.split('.').pop();


      this.backendService.uploadfile(fileObj).subscribe(response => {
        // Handle the response from the server
        const targetElement = event.target as HTMLElement;
        const collapseNativeElement = this.collapseElement.nativeElement;
        // Check if the clicked element is outside the collapse and if the collapse is currently shown
        if (collapseNativeElement.classList.contains('show')) {

          collapseNativeElement.classList.remove('show');
          // do something...
        }
        const time = new Date();

        this.uploadImgResponse =
        {
          type: "multimedia",
          fileUrl: response.fileUrl,
          fileName: response.fileName,
          messageId: "web_" + time.getTime(),
          detailType: fileExtension,
          sentAt: new Date(),
          receiver: this.userDetails?.user?.support,
          attachmentId: response.attachmentId,
          originalName: this.selectedFile?.name,
          size: this.selectedFile?.size,
          docType: this.selectedFile?.type
        }

        this.sendMessage();

      });
    }
  }

  // onUpload(): void {
  //   if (this.selectedFile) {
  //     const formData = new FormData();
  //     formData.append('file', this.selectedFile);

  //     this.http.post('http://your-api-endpoint/upload', formData)
  //       .subscribe(response => {
  //         // Handle the response from the server
  //         console.log(response);
  //       });
  //   }
  // }

  dropdownVisible: boolean = false;

  openDropDow() {
    this.dropdownVisible = !this.dropdownVisible;
  }


  
  startRecording(): void {
    this.audioRecording=true;
    this.isSendButtonVisible=true;
    this.recordingService.startRecording();
    this.startAnimation()
  }

  stopRecording(): void {
    this.recordingService.stopRecording();
    this.stopAnimation();
  }

  // private startAnimation(): void {
  //   const canvasElement = this.waveformCanvasRef.nativeElement;
  //   const context = canvasElement.getContext('2d');

  //   if (context) {
  //     const animationLoop = () => {
  //       // Update dataArray and draw visualization
  //       this.updateAndDraw(context);

  //       // Continue the animation loop
  //       this.animationFrameId = requestAnimationFrame(animationLoop);
  //     };

  //     // Start the animation loop
  //     animationLoop();
  //   }
  // }

  // private stopAnimation(): void {
  //   if (this.animationFrameId !== undefined) {
  //     cancelAnimationFrame(this.animationFrameId);
  //     this.animationFrameId = undefined;
  //   }
  // }

 private startAnimation(): void {
  this.ngZone.runOutsideAngular(() => {
    const canvas = this.waveformCanvasRef.nativeElement;
    let position = 0;

    const animate = (context: CanvasRenderingContext2D | null) => {
      if (!context) {
        // Canvas context is not available, exit the animation loop
        return;
      }

      position += 5; // Adjust the speed of the animation

      if (position > canvas.width) {
        // Reset position when it exceeds canvas width
        position = 0;
      }

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the waveform at the new offset
      this.updateAndDraw(context, position);

      // Continue the animation
      this.animationFrameId = requestAnimationFrame(() => animate(context));
    };

    // Start the animation loop
    this.animationFrameId = requestAnimationFrame(() => animate(canvas.getContext('2d')));
  });
}

  private stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private updateAndDraw(context: CanvasRenderingContext2D,position: number): void {
    if (!context) {
      // Canvas context is not available, exit early
      return;
    }
    const dataArray = this.recordingService.getAudioDataArray();
  const canvasElement = this.waveformCanvasRef.nativeElement;

  // Clear the canvas
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Draw vertical bars based on dataArray
  const barWidth = canvasElement.width / dataArray.length;

  for (let i = 0; i < dataArray.length; i++) {
    const normalizedValue = dataArray[i] / 218; // Normalize the value to be within [0, 1]
    const barHeight = normalizedValue * canvasElement.height;

    context.fillStyle = 'blue';
    context.fillRect(i * barWidth, canvasElement.height - barHeight, barWidth, barHeight);
  }
  }

  // private updateAndDraw(context: CanvasRenderingContext2D): void {
  
  //   const dataArray = this.recordingService.getAudioDataArray();
  //   const canvasElement = this.waveformCanvasRef.nativeElement;
  
  //   // console.log('dataArray:', dataArray)
  //   // Clear the canvas
  //   context.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  //   // Draw the visualization based on dataArray
  //   context.beginPath();
  //   const sliceWidth = canvasElement.width / dataArray.length;
  //   let x = 0;
  
  //   for (const value of dataArray) {
  //     const normalizedValue = value / 218; // Normalize the value to be within [0, 1]
  //     const y = normalizedValue * canvasElement.height;
  
  //     if (x === 0) {
  //       context.moveTo(x, y);
  //     } else {
  //       context.lineTo(x, y);
  //     }
  
  //     x += sliceWidth;
  //   }

  
  //   context.strokeStyle = 'blue';
  //   context.lineWidth = 2;
  //   context.stroke();
  // }
}
