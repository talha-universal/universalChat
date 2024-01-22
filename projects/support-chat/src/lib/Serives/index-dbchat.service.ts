import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { from, Observable, Subject } from 'rxjs';
import { SocketMessage } from './message-interface';

@Injectable({
  providedIn: 'root',
})
export class IndexDBChatService {
  private readonly DB_NAME = 'ChatDb';
  private readonly STORE_NAME = 'your_store_name';
  private updateSubject: Subject<SocketMessage> = new Subject<SocketMessage>();
  private databaseReadySubject: Subject<void> = new Subject<void>();

  private db: IDBPDatabase<SocketMessage> | null = null;

  constructor() {
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
    console.log(this.db?.get('messages', messageId))
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

  public addMessage(newMessage: SocketMessage): Promise<void> {
    return this.db?.add('messages', newMessage).then(() => { /* No need to return anything */ }) || Promise.resolve();
  }

  public getUpdateObservable(): Observable<SocketMessage> {
    return this.updateSubject.asObservable();
  }

  public async removeOldMessages(): Promise<void> {
    debugger
    if (!this.db) {
      return;
    }
  
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 1);
  
    const transaction = this.db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    const messages = await store.getAll();
  
    for (const message of messages) {
      const messageSentAt = new Date(message.sentAt);
  
      if (messageSentAt < twentyFourHoursAgo) {
        await store.delete(message.messageId);
      }
    }
  }
  
}
