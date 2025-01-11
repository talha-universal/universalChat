import { ElementRef, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Define an interface for RecordingService

@Injectable({
  providedIn: 'root'
})
export class RecordingService  { 
  private mediaRecorder!: MediaRecorder;
  private mediaStream: MediaStream | undefined; 
  private chunks: Blob[] = [];
  private recordingCompletedSubject = new Subject<Blob>();
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;


  constructor() { 
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }



  // async startRecording(): Promise<void> {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     this.mediaStream =stream
  //     const audioContext: any = this.analyser.context;
  
  //     // Create a promise-based MediaRecorder initialization
  //     const mediaRecorderPromise = new Promise<MediaRecorder>((resolve, reject) => {
  //       const mediaRecorder = new MediaRecorder(stream);
  //       mediaRecorder.ondataavailable = (event) => {
  //         if (event.data.size > 0) {
  //           this.chunks.push(event.data);
  //         }
  //       };
  //       mediaRecorder.onstop = () => {
  //         const blob = new Blob(this.chunks, { type: 'audio/mp3' });
  //         console.log('Recording stopped. Blob size:', blob.size);
  //         this.chunks = [];
  //         this.recordingCompletedSubject.next(blob);
  //         console.log('Recording stopped 231');

  //       };
  //       resolve(mediaRecorder);
  //     });
  
  //     this.mediaRecorder = await mediaRecorderPromise;
  
  //     const source = audioContext.createMediaStreamSource(stream);
  //     source.connect(this.analyser);
  //     this.analyser.connect(audioContext.destination);
  
  //     this.mediaRecorder.start();
  //   } catch (error) {
  //     console.error('Error accessing microphone:', error);
  //     throw error; // Propagate the error for handling in the calling code
  //   }
  // }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext: any = this.analyser.context;

      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.chunks.length > 0) {
          const blob = new Blob(this.chunks, { type: 'audio/mp3' });
          this.chunks = [];
          this.recordingCompletedSubject.next(blob);
        } else {
          console.warn('No data recorded.');
        }
      };

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      this.analyser.connect(audioContext.destination);

      this.mediaStream = stream;
      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error; // Propagate the error for handling in the calling code
    }
  }
  
  // stopRecording(): void {
    
  //   if (this.mediaRecorder) {
  //     const blob = new Blob(this.chunks, { type: 'audio/mp3' });
  //     this.chunks = [];
  //     this.recordingCompletedSubject.next(blob);
  //     console.log('Stopping recording...');
      
  //     // Remove event listeners
  //     this.mediaRecorder.ondataavailable = null;
  //     this.mediaRecorder.onstop = null;
  
  //     // Stop the recording
  //     this.mediaRecorder.stop();
  
  //     // Reset the MediaRecorder instance
  //     this.mediaRecorder = undefined;
  
  //     // Disconnect the stream from the analyser
  //     if (this.mediaStream) {
  //       const audioContext: any = this.analyser.context;
  //       const source = audioContext.createMediaStreamSource(this.mediaStream);
  
  //       // Attempt to disconnect the source and log any errors
  //       try {
  //         // Check if the source is connected before disconnecting
  //         if (source.numberOfOutputs > 0 && source.numberOfInputs > 0) {
  //           source.disconnect(this.analyser);
  //           console.log('Source disconnected successfully.');
  //         } else {
  //           console.log('Source not connected, skipping disconnect.');
  //         }
  //       } catch (error) {
  //         console.error('Error disconnecting source:', error);
  //       }
  
  //       // Attempt to disconnect the analyser and log any errors
  //       try {
  //         // Check if the analyser is connected before disconnecting
  //         if (this.analyser.numberOfOutputs > 0 && audioContext.destination.numberOfInputs > 0) {
  //           this.analyser.disconnect(audioContext.destination);
  //           console.log('Analyser disconnected successfully.');
  //         } else {
  //           console.log('Analyser not connected, skipping disconnect.');
  //         }
  //       } catch (error) {
  //         console.error('Error disconnecting analyser:', error);
  //       }
  //     }
  //     setTimeout(() => {
  //       const blob = new Blob(this.chunks, { type: 'audio/mp3' });
  //       console.log("9989898 ",blob)
  //       this.chunks = [];
  //       this.recordingCompletedSubject.next(blob);
  //       console.log('Recording stopped successfully.');
  //     }, 1000); 
  //   } else {
  //     console.warn('MediaRecorder is not defined.');
  //   }
  // }
  
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaStream) {
      console.log('Stopping recording...');

      this.mediaRecorder.stop();

      // Disconnect the stream from the analyser
      const audioContext: any = this.analyser.context;
      const source = audioContext.createMediaStreamSource(this.mediaStream);

      // Attempt to disconnect the source and log any errors
      try {
        if (source.numberOfOutputs > 0 && source.numberOfInputs > 0) {
          source.disconnect(this.analyser);
          console.log('Source disconnected successfully.');
        } else {
          console.log('Source not connected, skipping disconnect.');
        }
      } catch (error) {
        console.error('Error disconnecting source:', error);
      }

      // Attempt to disconnect the analyser and log any errors
      try {
        if (this.analyser.numberOfOutputs > 0 && audioContext.destination.numberOfInputs > 0) {
          this.analyser.disconnect(audioContext.destination);
          console.log('Analyser disconnected successfully.');
        } else {
          console.log('Analyser not connected, skipping disconnect.');
        }
      } catch (error) {
        console.error('Error disconnecting analyser:', error);
      }
    } else {
      console.warn('MediaRecorder or MediaStream is not defined.');
    }
  }
  
  


  getRecordingCompletedObservable(): Observable<Blob> {
    return this.recordingCompletedSubject.asObservable();
  }

  getAudioDataArray(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  private connectAnalyser(stream: MediaStream): void {
    const audioContext: any = this.analyser.context;  // Cast to 'any' to avoid type-checking issues
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.analyser.connect(audioContext.destination);
  }
}
