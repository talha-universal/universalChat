// import { Injectable } from '@angular/core';
// import { BehaviorSubject, forkJoin, map, Observable, Subject, } from 'rxjs';
// import { NetworkService } from './network.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class MainService {
//   private AllSportsStatic: any;
//   private AllSports = new Subject<any>();
//   private LoggedIn = new Subject<any>();
//   private sportsList: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);
//   constructor(
//     private backendService: NetworkService,) {

//   }

//   getDataFromServices(key: any, timeLimit: any, payload?: any): Observable<any> {
//     return new Observable<any>((observer) => {
//       if (!payload) {
//         payload = {}
//       }
//       const path = key.split('/').filter(Boolean).pop();
//       this.indexedDBService.getRecord(path + 'Time').subscribe(
//         (data: any) => {
//           if (data) {
//             const date1 = new Date(data);
//             const date2 = new Date();
//             const diffInMilliseconds = date2.getTime() - date1.getTime();
//             const minutes = Math.floor(diffInMilliseconds / (1000 * 60));
//             if (minutes > timeLimit) {

//               this.getRecordsFromNetwork(key, payload).subscribe((data: any) => {

//                 observer.next(data);
//                 observer.complete();

//               }, (error) => {
//                 observer.error(error);
//               })
//             } else {
//               this.getRecordsFromDB(key, payload).subscribe((data: any) => {
//                 observer.next(data);
//                 observer.complete();
//               }, (error) => {
//                 observer.error(error);
//               })
//             }
//           } else {
//             this.getRecordsFromNetwork(key, payload).subscribe((data: any) => {
//               observer.next(data);
//               observer.complete();

//             }, (error) => {
//               observer.error(error);
//             })
//           }
//         });
//     });
//   }
//   setLoggedIn(loginState: any) {
//     this.LoggedIn.next(loginState);
//   }
//   getLoggedIn(): Observable<any> {
//     return this.LoggedIn.asObservable();
//   }

//   createtimestamp(key: any): Observable<Boolean> {
//     return this.indexedDBService.createRecord(key, Date());
//   }

//   private getRecordsFromNetwork(key: any, payload?: any): Observable<any> {
//     return new Observable<any>((observer) => {
//       const path = key.split('/').filter(Boolean).pop();;
//       this.backendService.getAllRecordsByPost(key, payload).subscribe((record: any) => {
//         if (path == 'bannerList') {

//           this.ImageToBase64Manager(record.data).subscribe((res: any) => {
//             this.indexedDBService.createRecord(path, res).subscribe(() => {
//               this.createtimestamp(path + 'Time').subscribe(() => {
//                 observer.next(res);
//                 observer.complete();
//               }, (error) => {
//                 observer.error(error);
//               });
//             }, (error) => {
//               observer.error(error);
//             });
//           })
//         }
//         else if (path == 'virtualSportsList' || path == 'casinoEvents') {
//           let data;
//           if (path == 'casinoEvents') {
//             data = record.data.lobby;
//           }
//           else if (path == 'virtualSportsList') {
//             data = record.data;
//           }
//           this.casinoImgsManager(data, path, 'lobby').subscribe((res: any) => {
//             if (path == 'casinoEvents') {
//               res.menu = record.data.menu;
//             }
//             this.indexedDBService.createRecord(path, res).subscribe(() => {
//               this.createtimestamp(path + 'Time').subscribe(() => {
//                 observer.next(res);
//                 observer.complete();
//               }, (error) => {
//                 observer.error(error);
//               });
//             }, (error) => {
//               observer.error(error);
//             });
//           })
//         }
//         else if (path == 'getThemeConfig') {
//           this.ImageToBase64ThemeConfigManager(record.data).subscribe((res: any) => {
//             this.indexedDBService.createRecord(path, res).subscribe(() => {
//               this.createtimestamp(path + 'Time').subscribe(() => {
//                 observer.next(res);
//                 observer.complete();
//               }, (error) => {
//                 observer.error(error);
//               });
//             }, (error) => {
//               observer.error(error);
//             });

//           });
//         }
//         else {
//           this.indexedDBService.createRecord(path, record).subscribe(() => {
//             this.createtimestamp(path + 'Time').subscribe(() => {
//               observer.next(record);
//               observer.complete();
//             }, (error) => {
//               observer.error(error);
//             });
//           }, (error) => {
//             observer.error(error);
//           });
//         }

//       }, (error) => {
//         observer.error(error);
//       })
//     });
//   }

//   private getRecordsFromDB(key: any, payload?: any): Observable<any> {
//     return new Observable<any>((observer) => {
//       const path = key.split('/').filter(Boolean).pop();
//       this.indexedDBService.getRecord(path).subscribe(
//         (data: any) => {
//           if (data) {
//             observer.next(data);
//             observer.complete();
//           }
//           else {
//             this.getRecordsFromNetwork(key, payload).subscribe((data: any) => {
//               observer.next(data);
//               observer.complete();
//             }, (error) => {
//               observer.error(error);
//             })
//           }
//         },
//         (error: any) => {
//           console.error('Error retrieving record: ', error);
//           observer.error(error);
//         }
//       );
//     });
//   }


//   private ImageToBase64Manager(data: any): Observable<any> {
//     const observables = Object.keys(data).map(key => {
//       const value = data[key];
//       return Observable.create((observer: any) => {
//         observer.next({ key, value: value });
//         observer.complete();
//       });
//     });

//     return forkJoin(observables).pipe(
//       map(results => data)
//     );
//   }



//   private ImageToBase64ThemeConfigManager(data: any): Observable<any> {
//     const observables = Object.keys(data).map(key => {
//       const value = data[key];
//       return Observable.create((observer: any) => {
//         if (key.includes('exchangeFavicon') || key.includes('exchangeLogo')) {

//           observer.next({ key, value: data[key] });
//           observer.complete();
//         }
//         else {
//           observer.next({ key, value: data[key] });
//           observer.complete();
//         }
//       });

//     });

//     return forkJoin(observables).pipe(
//       map(results => data)
//     );
//   }

//   private casinoImgsManager(data: any[], path: string, returnObjName: any): Observable<any> {
//     const observables = data.map(record => {
//       return Observable.create((observer: any) => {

//         observer.next(record);
//         observer.complete();
//       });
//     });

//     return forkJoin(observables).pipe(
//       map(results => {
//         const resultObject = results.reduce((obj, record) => {
//           const value = returnObjName;
//           if (!obj[value]) {
//             obj[value] = [];
//           }
//           obj[value].push(record);
//           return obj;
//         }, {});
//         return resultObject;
//       })
//     );
//   }

// }

