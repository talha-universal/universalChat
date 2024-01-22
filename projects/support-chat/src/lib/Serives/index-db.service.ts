import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { CONFIG } from '../../Config';
import { openDB, DBSchema, IDBPDatabase, IDBPObjectStore } from 'idb';


@Injectable({
  providedIn: 'root'
})
export class IndexDbService {
  private dbName = CONFIG.SiteName;
  private objectStoreName = CONFIG.SiteName + 'Store';
  private chatObjectStoreName = 'chats'; // New object store for chat messages
  private db: any;
  private databaseReadySubject: ReplaySubject<void> = new ReplaySubject<void>(1);
  

  constructor() {
    this.openDatabase();

    this.initDatabase();
  }

  private openDatabase() {
    const request = indexedDB.open(this.dbName, 1);

    request.onerror = (event: any) => {
      console.error('Database error: ', event.target.errorCode);
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      this.databaseReadySubject.next();
    };

    request.onupgradeneeded = (event: any) => {
      this.db = event.target.result;

      if (!this.db.objectStoreNames.contains(this.objectStoreName)) {
        const objectStore = this.db.createObjectStore(this.objectStoreName, {
          autoIncrement: false,
        });

        // objectStore.createIndex('Index', 'propertyName', { unique: false });
      }
    };
  }

  private databaseReady(): Observable<void> {
    return this.databaseReadySubject.asObservable();
  }

  createRecord(key: any, record: any): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.databaseReady().subscribe(() => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
        const objectStore = transaction.objectStore(this.objectStoreName);

        const request = objectStore.add(record, key);

        request.onerror = (event: any) => {
          if (event.target.error.code === 0) {
            this.updateRecord(key, record).subscribe(() => {
              observer.next(true);
              observer.complete();
            },
              (error) => {
                observer.error(event.target.error);
              });
          }
        };

        request.onsuccess = (event: any) => {
          observer.next(true);
          observer.complete();
        };
      });
    });
  }

  getRecord(key: any): Observable<any> {
    return new Observable<any>((observer) => {
      this.databaseReady().subscribe(() => {
        const transaction = this.db.transaction([this.objectStoreName], 'readonly');
        const objectStore = transaction.objectStore(this.objectStoreName);

        const request = objectStore.get(key);

        request.onerror = (event: any) => {
          observer.error(event.target.error);
        };

        request.onsuccess = (event: any) => {
          const record = event.target.result;
          observer.next(record);
          observer.complete();
        };
      });
    });
  }

  updateRecord(key: any, record: any): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.databaseReady().subscribe(() => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
        const objectStore = transaction.objectStore(this.objectStoreName);

        const request = objectStore.put(record, key);

        request.onerror = (event: any) => {
          observer.error(event.target.error);
        };

        request.onsuccess = (event: any) => {
          // console.log('Updated Data Successfully');
          observer.next(true);
          observer.complete();
        };
      });
    });
  }

  deleteRecord(key: any): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.databaseReady().subscribe(() => {
        const transaction = this.db.transaction([this.objectStoreName], 'readwrite');
        const objectStore = transaction.objectStore(this.objectStoreName);

        const request = objectStore.delete(key);

        request.onerror = (event: any) => {
          observer.error(event.target.error);
        };

        request.onsuccess = (event: any) => {
          observer.next(true);
          observer.complete();
        };
      });
    });
  }


  private async initDatabase(): Promise<void> {
    try {
      this.db = await openDB<MyDB>('my-database', 1, {
        upgrade(db) {
          // Create an object store for messages
          const messagesStore = db.createObjectStore('messages', {
            keyPath: 'messageId',
          });

          // Create an index for searching messages by some property if needed
          // messagesStore.createIndex('by_some_property', 'someProperty');
        },
      });
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  public getMessageById(messageId: string): Observable<any | null> {
    return new Observable((observer) => {
      if (!this.db) {
        observer.next(null);
        return;
      }

      const transaction = this.db.transaction('messages', 'readonly');
      const objectStore = transaction.objectStore('messages');
      const request = objectStore.get(messageId);

      request.onsuccess = () => {
        const message = request.result;
        observer.next(message || null);
      };

      request.onerror = () => {
        observer.next(null);
      };
    });
  }

  public updateMessage(updatedMessage: any): void {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction('messages', 'readwrite');
    const objectStore = transaction.objectStore('messages');
    objectStore.put(updatedMessage);
  }

  public addMessage(newMessage: any): void {
    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction('messages', 'readwrite');
    const objectStore = transaction.objectStore('messages');
    objectStore.add(newMessage);
  }
}

interface MyDB extends DBSchema {
  'messages': {
    key: string;
    value: any;
  };
}


