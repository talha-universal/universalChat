import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'lib-audio-message',
  standalone: true,
  imports: [NgIf],
  templateUrl: './audio-message.component.html',
  styleUrl: './audio-message.component.css',
  encapsulation: ViewEncapsulation.None
})
export class AudioMessageComponent implements AfterViewInit, OnDestroy {
  @Input() message!: any;
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;
  @ViewChild('waveformCanvas') waveformCanvas!: ElementRef<HTMLCanvasElement>;

  private animationId: number = 0;

  ngAfterViewInit() {
    this.initWaveformData();
    this.drawWaveform();
    this.setupAudioEvents();
  }

  ngOnDestroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  private setupAudioEvents() {
    const audio = this.audioElement.nativeElement;
    audio.addEventListener('loadedmetadata', () => {
      this.message.duration = audio.duration;
      this.drawWaveform();
    });
    audio.addEventListener('ended', () => {
      this.message.isPlaying = false;
      this.message.currentTime = 0;
      this.drawWaveform();
    });
    audio.addEventListener('pause', () => {
      this.message.isPlaying = false;
      this.drawWaveform();
    });
    audio.addEventListener('play', () => {
      this.message.isPlaying = true;
      this.animateWaveform();
    });
  }

  private initWaveformData() {
    if (!this.message.waveformData) {
      // Generate demo waveform data
      this.message.waveformData = Array.from({ length: 48 }, () => 0.2 + Math.random() * 0.6);
    }
  }

  togglePlayPause() {
    const audio = this.audioElement.nativeElement;
    if (audio.paused) {
      audio.play();
      this.message.isPlaying = true;
      this.animateWaveform();
    } else {
      audio.pause();
      this.message.isPlaying = false;
      if (this.animationId) cancelAnimationFrame(this.animationId);
    }
  }

  private animateWaveform() {
    if (!this.message.isPlaying) return;
    this.drawWaveform();
    this.animationId = requestAnimationFrame(() => this.animateWaveform());
  }

  private drawWaveform() {
    const canvas = this.waveformCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const bars = this.message.waveformData!;
    const barCount = bars.length;
    const barWidth = width / barCount;
    const audio = this.audioElement.nativeElement;
    const progress = audio.duration ? audio.currentTime / audio.duration : 0;

    // Draw waveform bars
    bars.forEach((bar: any, i: any) => {
      const x = i * barWidth;
      const barHeight = bar * height;
      ctx.fillStyle = (i / barCount < progress) ? '#34B7F1' : '#54656f';
      ctx.fillRect(x + 1, (height - barHeight) / 2, barWidth - 2, barHeight);
    });

    // Draw moving blue dot (pointer)
    if (audio.duration && (this.message.isPlaying || audio.currentTime > 0)) {
      const dotX = Math.min(progress * width, width - 8);
      ctx.beginPath();
      ctx.arc(dotX, height / 2, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#34B7F1';
      ctx.shadowColor = '#34B7F1';
      ctx.shadowBlur = 2;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  onTimeUpdate() {
    const audio = this.audioElement.nativeElement;
    this.message.currentTime = audio.currentTime;
    // Don't call drawWaveform here, it's called in animation loop
  }

  formatTime(seconds: number | undefined): string {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
