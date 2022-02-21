import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, filter, interval, map, mapTo, Observable, of, scan, takeWhile, tap } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private refreshTokenCountdown: Observable<any> = of(null);
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  private isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);

  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

  // combining...
  // - the latest known state of whether the user is authorized
  // - whether the ajax calls for initial log in have all been done
  public canActivateProtectedRoutes$: Observable<boolean> =
    combineLatest([this.isAuthenticated$, this.isDoneLoading$])
      .pipe(map((values: any) => values.every((b: any) => b)));

  constructor(
    private _oauthService: OAuthService,
    private _router: Router,
    private _userService: UserService
  ) {

    // This is tricky, as it might cause race conditions (where access_token is set in another
    // tab before everything is said and done there.
    // TODO: Improve this setup. See: https://github.com/jeroenheijmans/sample-angular-oauth2-oidc-with-auth-guards/issues/2
    window.addEventListener('storage', (event) => {
      // The `key` is `null` if the event was caused by `.clear()`
      if (event.key !== 'access_token' && event.key !== null) return;

      console.warn('Noticed changes to access_token (most likely from another tab), updating isAuthenticated');
      this.isAuthenticatedSubject$.next(this._oauthService.hasValidAccessToken());

      if (!this._oauthService.hasValidAccessToken()) this._navigateToLoginPage();
    });

    this._oauthService.events
      .pipe(filter((e: any) => e instanceof OAuthErrorEvent))
      .subscribe(event => console.error(`OAuthErrorEvent: ${event.type}`));

    this._oauthService.events
      .subscribe(_ => this.isAuthenticatedSubject$.next(this._oauthService.hasValidAccessToken()));

    this._oauthService.events
      .pipe(filter((e: any) => ['token_received'].includes(e.type)))
      .subscribe((e: any) => this._oauthService.loadUserProfile());

    this._oauthService.events
      .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
      .subscribe((e: any) => this._navigateToLoginPage());

  }

  // =====================
  // login sequence
  // =====================

  public login(): Promise<void> {
    return this._oauthService
      .loadDiscoveryDocumentAndLogin()
      .then(() => {
        this.isDoneLoadingSubject$.next(true);

        if (this._oauthService.hasValidAccessToken()) {
          this._userService.loadUserProfile();
          this._startExpiryTimer();
        }

        // Check for the strings 'undefined' and 'null' just to be sure. Our current
        // login(...) should never have this, but in case someone ever calls
        // initImplicitFlow(undefined | null) this could happen.
        if (this._oauthService.state && this._oauthService.state !== 'undefined' && this._oauthService.state !== 'null') {
          let stateUrl = this._oauthService.state;
          if (!stateUrl.startsWith('/')) stateUrl = decodeURIComponent(stateUrl);
          console.log(`There was state of ${this._oauthService.state}, so we are sending you to: ${stateUrl}`);
          this._router.navigateByUrl(stateUrl);
        }
      })
      .catch(() => this.isDoneLoadingSubject$.next(true));
  }

  // =====================
  // auth getters
  // =====================

  public get identityClaims(): { name: string } { return this._oauthService.getIdentityClaims() as { name: string }; }
  public get accessToken() { return this._oauthService.getAccessToken(); }
  public get idToken() { return this._oauthService.getIdToken(); }
  public get logoutUrl() { return this._oauthService.logoutUrl; }
  public get expiration(): number { return this._oauthService.getAccessTokenExpiration(); }
  public get expirationCountdown() { return this.refreshTokenCountdown; }

  // =====================
  // helpers
  // =====================

  private _navigateToLoginPage() {
    this._router.navigateByUrl('/');
  }

  private _startExpiryTimer() {

    // I have when it expires
    const expires = this._oauthService.getAccessTokenExpiration();

    // I have the current time
    const current = new Date().getTime();

    // I have the difference between those 2 times
    const timeout = expires - current;

    // I set a timeout catch
    setTimeout(() => {
      window.alert('TIME IS UP!');
      this.refreshTokenCountdown = of(null);
      this._oauthService.logOut();

      setTimeout(() => this.login(), 1000);

    }, timeout);

    // I start a countdown
    this.refreshTokenCountdown = interval(1000).pipe(
      mapTo(-1000),
      scan((acc: number, curr: number) => acc + curr, timeout),
      takeWhile(val => val >= 0),
    );
  }

}
