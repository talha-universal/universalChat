import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subject, throwError } from 'rxjs';
import { CONFIG } from '../../Config';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private betStakes: any;
  // private betstakeObs = new Subject<any>();

  constructor(private http: HttpClient) { }


  // createAuthorizationHeader(headers: Headers,token:any) {
  //   headers.append('Authorization', 'Bearer ' +
  //     token); 
  // }

  private createAuthorizationHeader(token: string | null): HttpHeaders {
    let headers = new HttpHeaders();
    if (token) {
      headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token
      });
    }
    return headers;
  }
  getAllRecordsByPost(url: any, params: any) {
    return this.http.post<any>(url, params)
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          // Handle other errors
          return throwError(() => error);

        })

      );
  }

  getSupporterStatusByGet(url: any, params: any) {

    let headers = new HttpHeaders();
    const token = JSON.parse(localStorage.getItem('webLogin') || '{}').data?.user?.token?.token;

    headers = this.createAuthorizationHeader(token);

    const requestUrl = url + '/' + params
    return this.http.get<any>(requestUrl, { headers })
      .pipe(map(data => {
        return data;
      }));
  }

  uploadfile(imgObj: any) {
    let headers = new HttpHeaders();
    const token = JSON.parse(localStorage.getItem('webLogin') || '{}').data?.user?.token?.token;
    headers = this.createAuthorizationHeader(token);
    const formData = new FormData();
    formData.append('file', imgObj.file);
    formData.append('attachmentId', imgObj.attachmentId);

    return this.http.post<any>(CONFIG.uploadDocument, formData, {headers})
      .pipe(
        map(data => {
          return data;
        }),
        catchError(error => {
          // Handle other errors
          return throwError(() => error);
        })
      );

  }


  private setLocalStorage(key: any, data: any): void {
    localStorage.setItem(key, JSON.stringify(data)); // Store data as a JSON string
    localStorage.setItem(key + 'Time', new Date().toString());
  }

  getLocalStorage(key: any): Observable<any> {
    const record = localStorage.getItem(key);

    if (record) {
      if (key.includes('Time')) {
        return of(record);
      }
      else {
        const parsedRecord = JSON.parse(record);
        return of(parsedRecord); // Return parsed record using RxJS's 'of' operator
      }

    } else {
      return of(null); // Return an observable with null if record doesn't exist
    }
  }

  recordsFromLocalStorage(key: string, time: number, payload?: any): Observable<any> {
    return new Observable<any>((observer) => {
      const path = key.split('/').filter(Boolean).pop();

      this.getLocalStorage(path + 'Time').subscribe((res: any) => {
        if (res) {
          const date1 = new Date(res);
          const date2 = new Date();
          const diffInMilliseconds = date2.getTime() - date1.getTime();
          const minutes = Math.floor(diffInMilliseconds / (1000 * 60));

          if (minutes <= time) {
            this.getLocalStorage(path).subscribe((data: any) => {
              observer.next(data); // Emit the stored data if within the specified time
              observer.complete();
            });
          } else {
            this.getRecordsFromNetwork(key, payload).subscribe((res) => {
              observer.next(res);
              observer.complete();
            }, (error) => {
              observer.error(error);
            })
          }
        } else {
          this.getRecordsFromNetwork(key, payload).subscribe((res) => {
            observer.next(res);
            observer.complete();
          }, (error) => {
            observer.error(error);
          })
        }
      });
    });
  }

  public getRecordsFromNetwork(key: any, payload?: any): Observable<any> {
    return new Observable<any>((observer) => {
      const path = key.split('/').filter(Boolean).pop();;
      this.getAllRecordsByPost(key, payload).subscribe((record: any) => {

        this.setLocalStorage(path, record)
        observer.next(record);
        observer.complete();

      }, (error) => {
        observer.error(error);
      })
    });
  }
}



