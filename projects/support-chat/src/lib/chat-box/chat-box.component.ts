import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG } from '../../Config';
import { NetworkService } from '../Serives/network.service';
import { WebsocketService } from '../Serives/websocket.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first } from 'rxjs';
import { SocketMessage } from '../Serives/message-interface';
import { WebSocketService } from '../Serives';
import { RecordingService } from '../Serives/recording.service';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any; @Component({
  selector: 'lib-chat-box',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css',
})
export class ChatBoxComponent implements OnInit, OnDestroy, AfterViewInit {
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
  loginData: any = {};
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
  blobAudio: any;
  editMessage: any;
  editMessageIndex: any;
  editMessageCom: any;
  agentDetail: any;
  agentName: any = {};
  // messages: SocketMessage[] = [];
  constructor(private backendService: NetworkService, private websocketService: WebsocketService,
    private devicedetector: DeviceDetectorService,
    private recordingService: RecordingService,
    private sanitizer: DomSanitizer,
    private socketService: WebSocketService,
    private ngZone: NgZone, private el: ElementRef) {

 


    this.isDesktop = this.devicedetector.isDesktop();
    // Check if the current device is a mobile

    this.isMobile = this.devicedetector.isMobile();
    this.isDesktop = this.devicedetector.isDesktop();
    this.isMobileInfo = this.devicedetector.os;


  }
  ngOnInit(): void {
    this.socketService.connect();

    this.userDetails = localStorage.getItem('webLogin') as string | '';
    if (this.userDetails == '' || this.userDetails == null || this.userDetails == undefined) {
      this.guestUserLogin = false;
    } else {
      this.LoginGuestUser(this.userDetails);
    }


    this.socketService.onEvent('client_joined', (data) => {
      this.clientDetail(data)
      // console.log('Received message event:', data);
    });

    this.socketService.onEvent('message', (data) => {
      this.updateIncomingMessage(data);
      // console.log('Received message event:', data);
    });

    this.socketService.onEvent('message_history', (data) => {
      this.messages = data.messages;
      // console.log('Received message event:', data);
    });
  }

  ngOnDestroy(): void {
    // this.stopAnimation();
    // this.stopRecording();
    this.websocketService.closeSocket();
    this.messages = [];
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflow = 'auto';
  }
  ngAfterViewInit(): void {

  }


  clientDetail(data: any) {
    this.loginData = data;
  }

  updateIncomingMessage(newMessage: any): void {
    const index = this.messages.findIndex(
      (msg: any) => msg.message === newMessage.message
    );

    if (index >= 0) {
      // Replace the existing message
      this.messages.splice(index, 1, newMessage);
      this.scrollChat();
    } else 
    {
      // Add new message
      this.messages.push(newMessage);
      this.scrollChat();
    }
    this.scrollChat();
  }
  scrollChat() {
    setTimeout(() => {
      const parent = document.querySelector('.message');
      const lastChild = parent?.lastElementChild;

      if (parent) {
        parent.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest',
        });
      }
    }, 500);
  }


  deleteMessage(msg: any, index: any) {
    let layload = {
      id: msg._id,
    }

    this.backendService.allPostWithToken(CONFIG.deleteMessage, layload).pipe(first())
      .subscribe((res) => {
        if (res.status == 'success') {
          // this.socketService.emitDeleteMessage(msg._id);

          let actualIndex = (this.messages.length - 1) - index;
          this.messages.splice(actualIndex, 1);
        }
      });

  }

  updateMessage(msg: any, index: any) {
    this.editMessage = msg.message;
    this.editMessageIndex = index;
    this.editMessageCom = msg;
  }


  editText(message: any) {

    let layload = {
      id: this.editMessageCom._id,
      newMessage: message,
    }

    this.backendService.allPostWithToken(CONFIG.updateMessage, layload).pipe(first())
      .subscribe((resp) => {
        if (resp.status == 'success') {

          // this.socketService.emitEditMessage(layload);
          this.editMessageCom.message = message;
          let actualIndex = (this.messages.length - 1) - this.editMessageIndex;

          this.messages[actualIndex] = this.editMessageCom;
        }
      });

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

    // if (this.messageText.length > 0 && this.sendSocketstatus == 1) {
    //   this.sendSocketstatus = 0;
    //   const typingObj = {
    //     type: "action",
    //     action: "dirty",
    //     sender: this.userDetails?.user?.id,
    //     receiver: this.userDetails?.user?.support,
    //     flag: "yes"
    //   }
    //   this.websocketService.send(typingObj);
    // }

  }

  CloseChatBox() {
    this.isVisible = false
    this.chatBoxClose.emit();
    
  }



  startChat() {
    if (this.userName) {
      this.LoginGuestUser(this.userName)

    }
  }



  LoginGuestUser(userLoginObj?: any) {

    let clientId = userLoginObj.trim();
    if (!clientId) return alert('Please enter a valid client ID.');
    this.guestUserLogin = true;
    localStorage.setItem('webLogin', clientId);

    this.socketService.sendMessage('init', clientId);
    this.chatUserName = clientId;

  }

  obj: any = {

    from: "nnn",
    sender: "client",
    message: "dada",
    type: "text",
    timestamp: 1747648934425,

  }


  sendMessage() {


    this.isSendButtonClick = true;
    const chatBox = document.getElementById('chatMessage');
    chatBox?.focus();
    const formatDate = (date: Date): string => {
      return date.toISOString();
    };
    if (this.messageText.trim() !== '' && this.messageText !== undefined) {
      const current = new Date();
      let message = this.messageText;
      this.socketService.sendMessage('message_to_agent', { message, type: 'text' });


      const newMessage = {
        type: "text",
        sender: "client",
        from: this.userDetails,
        message: this.messageText,
        timestamp: formatDate(current),
        myMessage: true
      };
      // this.showAnimation = true;
      // this.messages.push(newMessage);
      // console.log(this.messages)

      this.messageText = '';
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
          if (this.userDetails?.user?.email !== message?.sender.email) {
            const isReadReceiverObj = {
              type: "read_at",
              sender: this.userDetails?.user?.support,
              receiver: this.userDetails?.user?.id,
              id: message._id,
            }
            // this.messageHandlingService.sendMessage(isReadReceiverObj);
          }
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
     const messageList = document.getElementsByClassName("message-list")[0] as HTMLElement;
     messageList.style.touchAction = "none";
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
      debugger
      const fileInput = document.getElementById('mediaInput') as HTMLInputElement ;

      const fileName = this.selectedFile.name;
      const fileExtension = fileName.split('.').pop();


      const file = fileInput?.files?.[0];
      if (!file) return;
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
      
        reader.onload = (e: any) => {
          const img = new Image();
          img.src = e.target.result;
      
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
      
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
      
            canvas.toBlob(
              (blob: any) => {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
      
                const originalSize = (file.size / 1024).toFixed(2);
                const compressedSize = (compressedFile.size / 1024).toFixed(2);
      
                const formData = new FormData();
                formData.append('file', originalSize > compressedSize ? compressedFile : file);
      
                fetch('https://buzzmehi.com/upload', {
                  method: 'POST',
                  body: formData
                }).then((res: any) => res.json()).then((data: any) => {
                  if (data.error) return;
      
                  const url = data.url;
                  const type = 'image';
                  this.socketService.sendMessage('message_to_agent', { message: url, type });
                });
              },
              'image/jpeg',
              0.6
            );
          };
        };
      }
      else{
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('https://buzzmehi.com/upload', {
        method: 'POST',
        body: formData
        }).then(res => res.json()).then(data => {
        if(data.error) return;
        
        const url = data.url;
        const type = file.type.startsWith('image') ? 'image' :
               file.type.startsWith('video') ? 'video' : 'isfile';
      
               this.socketService.sendMessage('message_to_agent', { message: url, type });
        });
      }
      fileInput.value = '';


      // fileInput?.addEventListener('change', () => {
     
      // });
    


      // this.backendService.uploadfile(fileObj).subscribe(response => {
      //   // Handle the response from the server
      //   const targetElement = event.target as HTMLElement;
      //   const collapseNativeElement = this.collapseElement.nativeElement;
      //   // Check if the clicked element is outside the collapse and if the collapse is currently shown
      //   if (collapseNativeElement.classList.contains('show')) {

      //     collapseNativeElement.classList.remove('show');
      //     // do something...
      //   }
      //   const time = new Date();

      //   this.uploadImgResponse =
      //   {
      //     type: "multimedia",
      //     fileUrl: response.fileUrl,
      //     fileName: response.fileName,
      //     messageId: "web_" + time.getTime(),
      //     detailType: fileExtension,
      //     sentAt: new Date(),
      //     receiver: this.userDetails?.user?.support,
      //     attachmentId: response.attachmentId,
      //     originalName: this.selectedFile?.name,
      //     size: this.selectedFile?.size,
      //     docType: this.selectedFile?.type
      //   }

      //   this.sendMessage();

      // });
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
    this.audioRecording = true;
    this.isSendButtonVisible = true;
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

  private updateAndDraw(context: CanvasRenderingContext2D, position: number): void {
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
