import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrivateApiService {

  constructor(private http: HttpClient) { }

  getSecret(): Observable<string> {
    return this.http
      .get<string>('http://localhost:3000/secrets/secret')
      .pipe(
        tap(res => console.log(res)),
        map((res: any) => res.message)
      );
  }

}
