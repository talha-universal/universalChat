import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { WebsocketService } from 'support-chat';
import { SocketMessage } from './message-interface';

@Injectable({
  providedIn: 'root',
})
export class IndexDBChatService {
  private readonly DB_NAME = 'ChatDb';
  private readonly STORE_NAME = 'your_store_name';
  private updateSubject: Subject<SocketMessage> = new Subject<SocketMessage>();
  private databaseReadySubject: Subject<void> = new Subject<void>();

  // private deleteMessage = new Subject<any>();
  private deleteMessage: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public data$: Observable<any[]> = this.deleteMessage.asObservable();


  private db: IDBPDatabase<SocketMessage> | null = null;

  constructor( private websocketService: WebsocketService,) {
    this.initDatabase();
  }

  public async initDatabase(): Promise<void> {
    this.db = await openDB<SocketMessage>(this.DB_NAME, 1, {
      upgrade(db) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'messageId' });
      },
    });
  }

  public async getMessageById(messageId: string): Promise<SocketMessage | undefined> {
    // console.log(this.db?.get('messages', messageId))
    return this.db?.get('messages', messageId);
  }

  public getAllMessages(): Observable<SocketMessage[]> {
    return from(this.db?.getAll('messages') || []);
  }



  public getDatabaseReadyObservable(): Observable<void> {
    return this.databaseReadySubject.asObservable();
  }

  public async updateMessage(updatedMessage: SocketMessage): Promise<void> {
    // return this.db?.put('messages', updatedMessage).then(() => { /* No need to return anything */ }) || Promise.resolve();
    // return this.db?.put('messages', updatedMessage).then(() => { /* No need to return anything */ }) || Promise.resolve();
    if (!this.db) {
      return Promise.resolve();
    }

    try {
      await this.db.put('messages', updatedMessage);

      // Notify subscribers about the update
      this.updateSubject.next(updatedMessage);
    } catch (error) {
      console.error('Error updating message in IndexedDB:', error);
    }
  }

  // public addMessage(newMessage: SocketMessage): Promise<void> {
  //   return this.db?.add('messages', newMessage).then(() => { /* No need to return anything */ }) || Promise.resolve();
  // }


  public async addMessage(newMessage: SocketMessage): Promise<void> {
    if (!this.db) {
      return Promise.resolve();
    }

    try {
      const existingMessage = await this.getMessageById(newMessage.messageId);

      if (!existingMessage) {
        // If the message with the same messageId doesn't exist, add it to IndexedDB
        await this.db.add('messages', newMessage);

        // Notify subscribers about the update
        // this.updateSubject.next(newMessage);
        setTimeout(() => {
          // this.updateSubject.next(newMessage);
        }, 100);
      } else {
        // return
        // Optionally, handle the case where the message already exists
        // console.warn(`Message with ID ${newMessage.messageId} already exists.`);
      }
    } catch (error) {
      console.error('Error adding message to IndexedDB:', error);
    }
  }

  public getUpdateObservable(): Observable<SocketMessage> {
    return this.updateSubject.asObservable();
  }

  // public async removeOldMessages(): Promise<void> {
  //   debugger
  //   if (!this.db) {
  //     return;
  //   }

  //   const twentyFourHoursAgo = new Date();
  //   twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 1);

  //   const transaction = this.db.transaction('messages', 'readwrite');
  //   const store = transaction.objectStore('messages');
  //   const messages = await store.getAll();

  //   for (const message of messages) {
  //     const messageSentAt = new Date(message.sentAt);

  //     if (messageSentAt < twentyFourHoursAgo) {
  //       await store.delete(message.messageId);
  //     }
  //   }
  // }

  public async removeOldMessages(): Promise<void> {
    // console.log("call removeOldMessages")

    if (!this.db) {
      return;
    }

    try {
      const currentTime = new Date();
      const thresholdTime = new Date(currentTime);
      // thresholdTime.setMinutes(currentTime.getMinutes() - 2); // Remove messages older than 2 minutes
      thresholdTime.setHours(currentTime.getHours() - 8);

      const transaction = this.db.transaction('messages', 'readwrite');
      const store = transaction.objectStore('messages');
      const messages = await store.getAll();
      let deleteMessageIDs=[];
      for (const message of messages) {
        const messageSentAt = new Date(message.sentAt);
        // console.log("call before ifremoveOldMessages")
        if (messageSentAt < thresholdTime) {
          // console.log("call after if removeOldMessages")
          deleteMessageIDs.push(message._id)
          await store.delete(message.messageId);
          // Optionally, notify subscribers about the deleted message
          // this.updateSubject.next({ messageId: message.messageId, deleted: true });
        }
      }
      debugger
      // console.log(deleteMessageIDs)
      // this.deleteMessage.next(deleteMessageIDs);
      // this.setDelMessage("a");
      if(deleteMessageIDs.length > 0){
        this.setDelMessage(deleteMessageIDs);
        
        // console.log('He hit me deleteMessageIDs>0')
      }
      deleteMessageIDs = [];
    } catch (error) {
      console.error('Error removing old messages from IndexedDB:', error);
    }

  }


  setDelMessage(delObj: any) {
    this.deleteMessage.next(delObj);
    setTimeout(() => {
    this.deleteMessage.next([]); 
    }, 2000);
  }
  getDelMessage(): Observable<any>{
    return this.data$;
  }

}
