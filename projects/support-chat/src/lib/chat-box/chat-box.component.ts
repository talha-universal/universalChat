import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG, BASE_URL } from '../../Config';
import { NetworkService } from '../Serives/network.service';
import { WebsocketService } from '../Serives/websocket.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { first } from 'rxjs';
import { SocketMessage } from '../Serives/message-interface';
import { WebSocketService } from '../Serives';
import { RecordingService } from '../Serives/recording.service';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AudioMessageComponent } from '../audio-message/audio-message.component';
declare var $: any; @Component({
  selector: 'lib-chat-box',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, DatePipe, AudioMessageComponent],
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

  @ViewChild('emojiPanel') emojiPanel!: ElementRef;
  @ViewChild('collapseElement', { static: false }) collapseElement!: ElementRef;
  isSendButtonVisible: boolean = false;
  audioRecording: any = false;
  isEmojiPickerOpen = false;

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
  baseURL: any = BASE_URL;
  isUploading: boolean = false;

  // isRecording = false;
  dataArray: Uint8Array | undefined;
  private animationFrameId: number | undefined;
  audiofileType: boolean = false;

  private canvasVisible = false;
  // private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  blobAudio: any;
  editMessage: any;
  editMessageIndex: any;
  editMessageCom: any;
  agentDetail: any;
  agentName: any = {};
  deletedMessage: any;
  shouldShowEditButton: boolean = false;
  // messages: SocketMessage[] = [];
  constructor(private backendService: NetworkService, private websocketService: WebsocketService,
    private devicedetector: DeviceDetectorService,
    private recordingService: RecordingService,
    private sanitizer: DomSanitizer,
    private socketService: WebSocketService,
    private http: HttpClient,
    private ngZone: NgZone, private el: ElementRef) {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !('MSStream' in window);
    this.isIOSChrome = isIOS && /CriOS/.test(ua); // CriOS = Chrome on iOS


    this.baseURL = BASE_URL;

    this.isDesktop = this.devicedetector.isDesktop();
    // Check if the current device is a mobile

    this.isMobile = this.devicedetector.isMobile();
    this.isDesktop = this.devicedetector.isDesktop();
    this.isMobileInfo = this.devicedetector.os;


  }

  selectedMessage: any = null;
  submitEdit(closeBtn: HTMLElement) {
    this.editText(this.editMessage); // Call the function
    closeBtn.click();                // Close the modal
  }
  ngOnInit(): void {
    this.socketService.connect();

    this.userDetails = localStorage.getItem('webLogin') as string | '';
    if (this.userDetails == '' || this.userDetails == null || this.userDetails == undefined) {
      this.guestUserLogin = false;
    } else {
      this.LoginGuestUser(this.userDetails);
    }

    //============ GET DATA FROM SOCKET =============//

    this.socketService.onEvent('client_joined', (data) => {
      this.clientDetail(data)
    });

    this.socketService.onEvent('message', (data) => {
      this.updateIncomingMessage(data);
    });

    this.socketService.onEvent('message_history', (data) => {
      // this.messages = data.messages;

      this.messages = data.messages.map((msg: any) => {
        if (msg.message?.includes('voice-message')) {
          const link = msg.viewurl?.includes('localhost')
            ? this.baseURL + msg.message
            : msg.viewurl + msg.message;

          msg.audio = new Audio(link);
          msg.isPlaying = false;
          msg.currentTime = 0;
          msg.content = link;
        }

        return msg;
      });

      console.log(this.messages)
    });



    this.socketService.onEvent('message_edited', (data) => {
      const { messageId, newContent } = data;

      this.messages = this.messages.map((msg: any) => {
        if (msg._id === messageId) {
          debugger
          return { ...msg, message: newContent, edited: true };
        }
        return msg;
      });
    });

    this.socketService.onEvent('message_deleted', (data) => {
      const { messageId } = data;

      const index = this.messages.findIndex((msg: any) => msg._id === messageId);

      if (index !== -1) {
        this.messages[index] = { deleted: true, message: '[deleted]', sender: 'client', timestamp: this.deletedMessage.timestamp };
        // If you need to trigger change detection (e.g. Angular), use:
        this.messages = [...this.messages];
      }
    });
  }

  ngOnDestroy(): void {
    // this.stopAnimation();
    // this.stopRecording();
    this.websocketService.closeSocket();
    this.messages = [];
    document.body.style.overflowY = 'auto';
    document.documentElement.style.overflow = 'auto';
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    clearInterval(this.timerInterval);
  }
  ngAfterViewInit(): void {
    this.scrollToTop();
  }


  clientDetail(data: any) {
    this.loginData = data;
  }

  updateIncomingMessage(newMessage: any): void {
    this.enableScrollToTopTemporarily();
    if (newMessage.message.includes('voice-message')) {
      let link = newMessage?.viewurl.includes('localhost') ? this.baseURL + newMessage?.message : newMessage?.viewurl + newMessage.message
      newMessage.audio = new Audio(link);
      newMessage.isPlaying = false;
      newMessage.currentTime = 0;
      newMessage.content = link;
    }
    this.messages.push(newMessage);
    this.scrollChat();
  }

  toggleAudio(message: any): void {
    debugger
    if (!message.audio) return;

    if (message.isPlaying) {
      message.audio.pause();
    } else {
      this.messages.forEach((msg: any) => {
        if (msg.audio && msg !== message) {
          msg.audio.pause();
          msg.isPlaying = false;
        }
      });
      message.audio.play();
    }

    message.isPlaying = !message.isPlaying;

    message.audio.onended = () => {
      message.isPlaying = false;
    };
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
    this.deletedMessage = msg;
  }
  deleteSelectedMessage(deleteType: any) {
    const messageId = this.deletedMessage._id;

    this.socketService.sendMessage('delete_message', { messageId });
  }

  updateMessage(msg: any, index: any) {
    this.msgAction = null;
    this.editMessage = msg.message;
    this.editMessageIndex = index;
    this.editMessageCom = msg;
    this.selectedMessage = msg; // 🔥 yeh line added ki hai
  }



  editText(message: any) {

    this.socketService.sendMessage('edit_message', {
      messageId: this.editMessageCom._id,
      newContent: message
    });

  }
  removeNamePdf(filename: any) {
    return filename.replace(/^[^-]*-/, "");
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


  sendMessage(messageOverride?: string) {
    this.enableScrollToTopTemporarily();
    this.isSendButtonClick = true;
    this.isSendButtonVisible = false;
    const messageToSend = messageOverride ?? this.messageText?.trim();
    if (!messageToSend || messageToSend === '') return;
    if (!messageOverride) {
      const chatBox = document.getElementById('chatMessage');
      chatBox?.focus();
    }

    const formatDate = (date: Date): string => {
      return date.toISOString();
    };

    const current = new Date();

    this.socketService.sendMessage('message_to_agent', {
      message: messageToSend,
      type: 'text'
    });

    const newMessage = {
      type: "text",
      sender: "client",
      from: this.userDetails,
      message: messageToSend,
      timestamp: formatDate(current),
      myMessage: true
    };
    if (!messageOverride) {
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
    // if (windowHeight <= 915) {
    //   //  targetHeight = Math.floor(windowHeight * 0.52); //done
    //   targetHeight = Math.floor(windowHeight * 0.586);
    // }
    // else 
    if (this.isMobileInfo == 'iOS') {
      targetHeight = Math.floor(windowHeight * 0.615);
    }
    // else if (windowHeight <= 720) {
    //   targetHeight = Math.floor(windowHeight * 0.61);
    // }
    // else {
    //   targetHeight = Math.floor(windowHeight * 0.62);
    // }

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


  readonly MAX_INPUT_MB = 2;
  readonly MAX_OUTPUT_MB = 1.5;
  readonly TARGET_WIDTH = 1280;

  onFileSelected(event: Event): void {
    this.enableScrollToTopTemporarily();
    this.isUploading = true;
    const collapseNativeElement = this.collapseElement?.nativeElement;
    if (collapseNativeElement?.classList.contains('show')) {
      collapseNativeElement.classList.remove('show');
    }
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (file.name.toLowerCase().endsWith('.heic')) {
      alert('HEIC images are not supported. Please upload JPG or PNG.');
      return;
    }
    const type = file.type;

    if (type.startsWith('image/') && !type.includes('heic')) {
      this.processAndUploadImage(file); // Your image compression + upload logic
    }
    else if (type.startsWith('video/')) {
      this.uploadVideoWithValidation(file);
    }
    else if (!type.startsWith('video/') || !type.startsWith('image/')) {
      this.uploadNonImageFile(file);
    }

    // Reset input
    input.value = '';
  }

  private async uploadVideoWithValidation(file: File): Promise<void> {
    const maxVideoSize = 6 * 1024 * 1024; // 6MB

    if (file.size <= maxVideoSize) {
      try {
        const compressed = await this.compressVideo(file);
        const compressedFile = new File([compressed], 'compressed.webm', { type: 'video/webm' });

        if (compressedFile.size > maxVideoSize) {
          alert('Compressed video is still too large. Please use a shorter or lower-quality video.');
          return;
        }

        this.uploadNonImageFile(compressedFile); // Upload only compressed
      } catch (err) {
        console.error('Compression failed', err);
        alert('Video compression failed. Please try a smaller video.');
      }
    }
    else {

      alert('Video is too large. Please upload a video under 6MB');
      return;
    }


  }


  // FILE UPLOAD CODE

  private uploadNonImageFile(file: File): void {
    // console.log('call')
    const formData = new FormData();
    formData.append('file', file);

    fetch('https://buzzmehi.com/upload', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) return;

        const url = data.url;
        const type = file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('video')
            ? 'video'
            : 'isfile';

        this.socketService.sendMessage('message_to_agent', { message: url, type });
      })
      .catch(err => {
        console.error('Upload error:', err);
      })
      .finally(() => {
        this.isUploading = false;
        this.enableScrollToTopTemporarily();
        if (this.audiofileType) {
          this.audiofileType = false
          this.clearRecording();
        }
        const collapseNativeElement = this.collapseElement?.nativeElement;
        if (collapseNativeElement?.classList.contains('show')) {
          collapseNativeElement.classList.remove('show');
        }
      });
  }


  private async compressVideo(file: File): Promise<Blob> {
    return new Promise<Blob>(async (resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      // Wait for metadata to load
      await new Promise<void>((res) => {
        video.onloadedmetadata = () => res();
      });

      const canvas = document.createElement('canvas');
      canvas.width = 640; // Resize to 640x360 (or keep original if smaller)
      canvas.height = 360;

      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(15); // 15 FPS
      const chunks: Blob[] = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
      });

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };

      recorder.start();

      // Seek and draw frames
      const duration = video.duration;
      const frameInterval = 1000 / 15;
      let currentTime = 0;

      const drawFrame = () => {
        if (currentTime >= duration) {
          recorder.stop();
          return;
        }

        video.currentTime = currentTime;
        video.onseeked = () => {
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          currentTime += frameInterval / 1000;
          setTimeout(drawFrame, frameInterval);
        };
      };

      drawFrame();
    });
  }


  private async processAndUploadImage(file: File): Promise<void> {
    const fileMB = file.size / (1024 * 1024);
    const img = await this.loadImage(file);

    // Resize dimensions
    let { width, height } = img;
    if (width > this.TARGET_WIDTH) {
      const ratio = this.TARGET_WIDTH / width;
      width = this.TARGET_WIDTH;
      height = height * ratio;
    }

    // Draw on canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, width, height);

    const formData = new FormData();

    if (fileMB > this.MAX_INPUT_MB) {
      const blob = await this.compressCanvas(canvas, this.MAX_OUTPUT_MB);
      const compressedFile = new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      formData.append('file', compressedFile);
    } else {
      formData.append('file', file);
    }

    this.upload(formData);
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private compressCanvas(canvas: HTMLCanvasElement, maxSizeMB: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      let quality = 0.9;

      const tryCompress = () => {
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Compression failed'));
          const sizeMB = blob.size / 1024 / 1024;
          if (sizeMB <= maxSizeMB || quality <= 0.1) return resolve(blob);
          quality -= 0.05;
          tryCompress();
        }, 'image/jpeg', quality);
      };

      tryCompress();
    });
  }

  private upload(formData: FormData): void {
    this.http.post<{ url: string; error?: any }>('https://buzzmehi.com/upload', formData)
      .subscribe({
        next: (data) => {
          if (data.error) return;
          const url = data.url;
          const type = 'image';
          // send via socket service or handle the result
          this.socketService.sendMessage('message_to_agent', { message: url, type });
          // console.log('Uploaded:', url);
        },
        error: (err) => {
          console.error('Upload error:', err)
          this.isUploading = false;
        },
        complete: () => {
          this.isUploading = false;
          // collapse UI or show success
          // const nativeEl = this.fileInput?.nativeElement;
          // nativeEl?.classList?.remove('show');
          const collapseNativeElement = this.collapseElement?.nativeElement;
          if (collapseNativeElement?.classList.contains('show')) {
            collapseNativeElement.classList.remove('show');
          }
        }
      });
  }

  dropdownVisible: boolean = false;

  openDropDow() {
    this.dropdownVisible = !this.dropdownVisible;
  }



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

  // messageText: string = '';
  emojis: string[] = ['😀', '😂', '😍', '😎', '😢', '😡', '👍', '🙏', '🎉', '❤️'];
  // isSendButtonVisible = false;

  addEmojiToMessage(emoji: string) {
    this.sendMessage(emoji);
    this.isEmojiPickerOpen = false;
  }

  toggleEmojiPicker(event: MouseEvent) {
    event.stopPropagation(); // prevent auto close
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }
  isIOSChrome: boolean;

  // audio recording

  isRecording = false;
  // isUploading = false;
  recordingTime = 0; // in seconds
  recordingError: string | null = null;
  recordedAudioURL: string | null = null;
  recordedAudioBlob: Blob | null = null;
  audioChunks: Blob[] = [];
  mediaRecorder!: MediaRecorder;
  stream!: MediaStream;
  timerInterval: any;


  // Convert seconds to mm:ss format
  get formattedTime(): string {
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  async handlePressStart(event: Event) {
    event.preventDefault();
    this.recordingError = null;
    this.recordingTime = 0;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.startRecording();
    } catch (err) {
      this.recordingError = '🎙️ Microphone permission denied. Please allow mic access.';
      console.error('Microphone error:', err);
    }
  }

  handlePressEnd(event: Event) {
    event.preventDefault();
    if (this.isRecording) {
      this.stopRecording();
    }
  }

  startRecording() {
    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.recordingTime = 0; // reset timer

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
      this.recordedAudioBlob = audioBlob;
      this.recordedAudioURL = URL.createObjectURL(audioBlob);

      this.ngZone.run(() => {
        // Only send if recording time is >= 1 second
        if (this.recordingTime >= 1) {
          this.sendAudioToAPI();
        } else {
          console.warn("Recording discarded (too short)");
        }
      });
    };

    this.mediaRecorder.start();
    this.isRecording = true;

    // Start Timer, update every second
    this.timerInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.recordingTime++;
      });
    }, 1000);
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      this.isRecording = false;

      // Stop Timer
      clearInterval(this.timerInterval);
    }
  }


  sendAudioToAPI(): void {
    this.enableScrollToTopTemporarily();
    if (!this.recordedAudioBlob) return;

    const audioFile = new File([this.recordedAudioBlob], 'voice-message.mp3', { type: 'audio/mp3' });
    this.isUploading = true;
    this.uploadNonImageFile(audioFile);
  }



  clearRecording() {
    if (this.recordedAudioURL) {
      URL.revokeObjectURL(this.recordedAudioURL);
    }
    this.recordedAudioURL = null;
    this.recordedAudioBlob = null;
    this.audioChunks = [];
    this.isUploading = false;
    this.recordingTime = 0;
  }
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  private shouldScrollToTop: boolean = false;

  ngAfterViewChecked() {
    if (this.shouldScrollToTop) {
      this.scrollToTop();
    }
  }
  private scrollToTop(): void {
    if (this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.scrollTop = 0;
    }
  }

  private enableScrollToTopTemporarily(): void {
    this.shouldScrollToTop = true;

    setTimeout(() => {
      this.shouldScrollToTop = false;
    }, 2000); // Disable after 2 seconds
  }

  msgAction: number | null = null;
  private outsideClickListener: any = null;
  private listenerTimeout: any = null;

  ismsgDell(index: number, message: any) {


    const TWENTY_MINUTES_IN_MS = 20 * 60 * 1000;
    const currentTime = Date.now();

    const timeDifference = currentTime - message.timestamp;

    this.shouldShowEditButton = timeDifference <= TWENTY_MINUTES_IN_MS;

    this.msgAction = this.msgAction === index ? null : index;

    // Remove any previous listener
    if (this.outsideClickListener) {
      document.removeEventListener('click', this.outsideClickListener);
      this.outsideClickListener = null;
    }

    // Clear previous timeout if exists
    if (this.listenerTimeout) {
      clearTimeout(this.listenerTimeout);
    }

    // Set timeout to attach listener after 1 second
    this.listenerTimeout = setTimeout(() => {
      this.outsideClickListener = (event: MouseEvent) => {
        const clickedInside = (event.target as HTMLElement).closest('.message-actions');
        if (!clickedInside) {
          this.handleClickOutside();
          document.removeEventListener('click', this.outsideClickListener);
          this.outsideClickListener = null;
        }
      };
      document.addEventListener('click', this.outsideClickListener);
    }, 100);
  }

  handleClickOutside() {
    this.msgAction = null;
  }


}
