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

  @ViewChild('recordButton') recordButton!: ElementRef<HTMLButtonElement>;

  isRecording = false;
  isLocked = false;
  isPaused = false;
  showLockHint = false;
  showDeleteIndicator = false;
  recordingTime = new Date(0);
  deleteSlideAmount = 0;
  isTouchDevice = false;
  isBrowser = false;

  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private timerInterval: any;
  private moveListener: any;
  private endListener: any;
  private lockHintTimeout: any;
  private recordingStartTime = 0;
  private pausedTime = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  }

  ngOnDestroy() {
    this.cleanup();
  }

  startRecording(event: MouseEvent | TouchEvent) {
    if (!this.isBrowser) return;

    event.preventDefault();
    event.stopPropagation();

    const clientX = this.isTouchDevice
      ? (event as TouchEvent).touches[0].clientX
      : (event as MouseEvent).clientX;
    const clientY = this.isTouchDevice
      ? (event as TouchEvent).touches[0].clientY
      : (event as MouseEvent).clientY;

    this.startX = clientX;
    this.startY = clientY;
    this.currentX = clientX;
    this.currentY = clientY;

    this.isRecording = true;
    this.isLocked = false;
    this.isPaused = false;
    this.showLockHint = false;
    this.showDeleteIndicator = false;
    this.deleteSlideAmount = 0;
    this.recordingTime = new Date(0);
    this.recordingStartTime = Date.now();
    this.pausedTime = 0;

    this.lockHintTimeout = setTimeout(() => {
      if (this.isRecording && !this.isLocked) {
        this.showLockHint = true;
      }
    }, 1000);

    this.startTimer();

    this.moveListener = this.handleMove.bind(this);
    this.endListener = this.handleEnd.bind(this);

    if (this.isTouchDevice) {
      window.addEventListener('touchmove', this.moveListener, { passive: false });
      window.addEventListener('touchend', this.endListener);
    } else {
      window.addEventListener('mousemove', this.moveListener);
      window.addEventListener('mouseup', this.endListener);
    }
  }

  private handleMove(event: MouseEvent | TouchEvent) {
    if (!this.isBrowser || !this.isRecording || this.isLocked || !this.recordButton?.nativeElement) return;

    this.currentX = this.isTouchDevice
      ? (event as TouchEvent).touches[0].clientX
      : (event as MouseEvent).clientX;
    this.currentY = this.isTouchDevice
      ? (event as TouchEvent).touches[0].clientY
      : (event as MouseEvent).clientY;

    const deltaX = this.currentX - this.startX;
    const deltaY = this.startY - this.currentY;

    const verticalMovementPercent = Math.min(100, (deltaY / 150) * 100);
    const horizontalMovementPercent = Math.min(100, Math.abs(deltaX / 150) * 100);

    if (deltaY > 30) {
      this.showLockHint = true;
      this.showDeleteIndicator = false;
      this.deleteSlideAmount = 0;

      const scale = 1.1 - (verticalMovementPercent * 0.1 / 100);
      const translateY = -verticalMovementPercent * 0.8;

      this.recordButton.nativeElement.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      this.recordButton.nativeElement.style.opacity = `${1 - (verticalMovementPercent / 200)}`;

      if (deltaY > 150) {
        this.isLocked = true;
      }
      return;
    }

    if (deltaX < -30) {
      this.showLockHint = false;
      this.showDeleteIndicator = true;

      const screenWidth = window.innerWidth;
      const maxSlide = screenWidth * 0.5; // 50% of screen
      const slideDistance = Math.min(maxSlide, Math.abs(deltaX));
      const translateX = -slideDistance;

      const scale = 1.5 - (horizontalMovementPercent * 0.1 / 100);
      const opacity = 1 - (horizontalMovementPercent / 200);

      this.recordButton.nativeElement.style.transform = `scale(${scale}) translateX(${translateX}px)`;
      this.recordButton.nativeElement.style.opacity = `${opacity}`;

      // ✅ Check if slide reached 50% — trigger delete
      if (slideDistance >= maxSlide) {
        this.cancelRecording(); // Your delete/cancel logic
        setTimeout(() => {
          this.cancelRecording(); // Animate back to original
        }, 100); // small delay to allow cancel to finish
      }

      return;
    }



    this.showDeleteIndicator = false;
    this.deleteSlideAmount = 0;
    if (this.recordButton?.nativeElement) {
      this.recordButton.nativeElement.style.transform = 'scale(1.5)';
      this.recordButton.nativeElement.style.opacity = '1';
    }
  }

  // ... rest of the methods remain the same with isBrowser checks ...
  private handleEnd() {
    if (!this.isBrowser || !this.isRecording || !this.recordButton?.nativeElement) return;

    this.recordButton.nativeElement.style.transform = '';
    this.recordButton.nativeElement.style.opacity = '';

    const deltaX = this.currentX - this.startX;

    if (this.showDeleteIndicator && deltaX < -100) {
      this.cancelRecording();
      return;
    }

    if (!this.isLocked) {
      this.sendRecording();
    }
  }

  togglePause() {
    if (!this.isBrowser) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      clearInterval(this.timerInterval);
      this.pausedTime = Date.now();
    } else {
      const pauseDuration = Date.now() - this.pausedTime;
      this.recordingStartTime += pauseDuration;
      this.startTimer();
    }
  }

  sendRecording() {
    if (!this.isBrowser) return;

    console.log('Recording sent');
    this.isLocked = false;
    this.showLockHint = false;
    this.stopRecording();
  }

  cancelRecording() {
    if (!this.isBrowser) return;

    const el = this.recordButton?.nativeElement;
    if (el) {
      el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      el.style.transform = 'scale(1.1) translateX(0px)';
      el.style.opacity = '1';

      // Optional: remove transition after animation
      setTimeout(() => {
        el.style.transition = '';
      }, 300);
    }

    console.log('Recording cancelled');
    this.isRecording = false;
    this.isLocked = false;
    this.isPaused = false;
    this.showLockHint = false;
    this.showDeleteIndicator = false;
    this.deleteSlideAmount = 0;
    this.cleanup();
  }

  stopRecording() {
    if (!this.isBrowser || !this.isRecording) return;

    this.isRecording = false;
    this.isLocked = false;
    this.isPaused = false;
    this.cleanup();
  }

  private startTimer() {
    if (!this.isBrowser) return;

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isRecording || this.isPaused) {
        clearInterval(this.timerInterval);
        return;
      }
      this.recordingTime = new Date(Date.now() - this.recordingStartTime);
    }, 1000);
  }

  private cleanupListeners() {
    if (!this.isBrowser) return;

    if (this.moveListener) {
      window.removeEventListener('mousemove', this.moveListener);
      window.removeEventListener('touchmove', this.moveListener);
    }

    if (this.endListener) {
      window.removeEventListener('mouseup', this.endListener);
      window.removeEventListener('touchend', this.endListener);
    }
  }

  private cleanup() {
    if (!this.isBrowser) return;

    clearInterval(this.timerInterval);
    if (this.lockHintTimeout) {
      clearTimeout(this.lockHintTimeout);
    }
    this.cleanupListeners();
  }


}
