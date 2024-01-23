import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';
import { IndexDBChatService } from './index-dbchat.service';
import { SocketMessage } from './message-interface';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class MessageHandlingService implements OnInit, OnDestroy {
  private messages: Subject<SocketMessage> = new Subject<SocketMessage>();
  private intervalId: any;

  constructor(
    private websocketService: WebsocketService,
    private indexedDBService: IndexDBChatService
  ) {
    this.init();
    this.subscribeToIndexDBUpdates();
    this.startPeriodicCheck();
   

  }
  ngOnDestroy(): void {
    this.stopPeriodicCheck();
  }

  private async init(): Promise<void> {

    this.websocketService.getMarketData().subscribe((data: any) => {
      this.processIncomingMessage(data);
    });
  }

  private async checkAndRemoveOldMessagesIfNeeded(): Promise<void> {
    // Check and remove old messages if needed
    console.log("call checkAndRemoveOldMessagesIfNeeded")
    await this.indexedDBService.removeOldMessages();
      this.indexedDBService.getDelMessage().pipe(take(1)).subscribe((delObj) => {
        
      // Handle the deletion message
      if (delObj.length > 0 && delObj !== '') {
        const messageDelete = {
          type: "delete",
          all: 'false',
          messageIds: delObj
        }
        console.log("Received deletion message:", delObj);
        this.websocketService.send(messageDelete);
      }

      this.indexedDBService.getAllMessages().subscribe((messages: SocketMessage[]) => {
        let updatedData : any= messages
        debugger
        // Emit the updated data to the UI
        this.emitMessage(updatedData);
        // Now 'messages' contains an array of SocketMessage objects
      });

    

    });
  }

  private startPeriodicCheck(): void {
    // Run the checkAndRemoveOldMessagesIfNeeded function every 30 minutes (30 * 60 * 1000 milliseconds)
    const cleanupIntervalMs = 1 * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.checkAndRemoveOldMessagesIfNeeded();
    }, cleanupIntervalMs);
    console.log("call")
  }

  private stopPeriodicCheck(): void {
    // Stop the periodic check when needed, for example, when the component is destroyed
    clearInterval(this.intervalId);
  }

  private subscribeToIndexDBUpdates(): void {
    this.indexedDBService.getUpdateObservable().subscribe((updatedMessage: SocketMessage) => {
      // Handle the update from IndexedDB, e.g., emit the updated message
      this.emitMessage(updatedMessage);
    });
  }

  ngOnInit(): void {
    debugger
    // this.indexedDBService.removeOldMessages();
  }

  private async processIncomingMessage(data: any): Promise<void> {
    if (data !== 'connected') {
      const socketData = JSON.parse(data);

      if (socketData?.type === 'message') {
        await this.handleIncomingMessage(socketData);
      }
    }
  }

  private async handleIncomingMessage(socketData: any): Promise<void> {
    const existingMessage = await this.indexedDBService.getMessageById(socketData.messageId);

    if (existingMessage) {
      this.updateMessageInIndexedDB(existingMessage, socketData);
    } else {
      const fetchedMessage = await this.indexedDBService.getMessageById(socketData.messageId);
      this.emitMessage(fetchedMessage || socketData);
    }
  }

  private updateMessageInIndexedDB(existingMessage: SocketMessage, socketData: any): void {
    if (existingMessage) {
      // Merge the properties from the WebSocket data into the existing message
      // this.mergeSocketData(existingMessage, socketData);

      // Update the existing message in IndexedDB with the merged data
      this.indexedDBService.updateMessage(socketData).then(() => {
        // Additional actions after updating the message, if needed
      }).catch((error) => {
        console.error('Error updating message in IndexedDB:', error);
      });
    } else {
      // If the message with the same messageId is not found, add it to IndexedDB
      this.indexedDBService.addMessage(socketData);
    }
  }


  private mergeSocketData(existingMessage: SocketMessage, socketData: any): void {
    debugger
    // Merge properties from the WebSocket data into the existing message
    // Modify this part based on your message structure and desired merging logic
    Object.assign(existingMessage, socketData);
  }
  // private async fetchAndEmitMessageFromIndexedDB(messageId: string): Promise<void> {
  //   const fetchedMessage = await this.indexedDBService.getMessageById(messageId);
  //   this.emitMessage(fetchedMessage);
  // }

  private emitMessage(message: SocketMessage): void {
    debugger
    this.messages.next(message);
  }

  public sendMessage(message: any): void {
    this.websocketService.addToSendQueue(message);
  }

  public getMessages(): Observable<SocketMessage> {
    return this.messages.asObservable();
  }
}