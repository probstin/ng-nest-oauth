import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { PrivateApiService } from './private-api.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent {

  secret$: Observable<string | undefined> = of(undefined);

  constructor(private _authService: AuthService, private _privateApiService: PrivateApiService) { }

  get expiry(): number { return this._authService.expiration };
  get identityClaims(): { name: string } { return this._authService.identityClaims; }
  get refreshTimeout(): any { return this._authService.expirationCountdown; }

  getSecret(): void {
    this.secret$ = this._privateApiService.getSecret();
  }

}
