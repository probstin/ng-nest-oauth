import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export interface UserProfile {
  name: string;
  email: string;
  username: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private _userProfile = new ReplaySubject<UserProfile>();
  public userProfile$ = this._userProfile.asObservable();

  constructor(private _http: HttpClient) { }

  loadUserProfile(): void {
    this._http
      .get<UserProfile>('http://localhost:3000/secrets/userProfile')
      .subscribe(res => this._userProfile.next(res));
  }
}
