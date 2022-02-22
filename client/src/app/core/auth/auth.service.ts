import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, filter, interval, map, mapTo, Observable, of, scan, takeWhile } from 'rxjs';
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
      .pipe(filter(e => e instanceof OAuthErrorEvent))
      .subscribe(e => console.error(`OAuthErrorEvent: ${e.type}`));

    this._oauthService.events
      .subscribe(_ => this.isAuthenticatedSubject$.next(this._oauthService.hasValidAccessToken()));

    this._oauthService.events
      .pipe(filter(e => ['token_received'].includes(e.type)))
      .subscribe(_ => this._oauthService.loadUserProfile());

    this._oauthService.events
      .pipe(filter(e => ['session_terminated', 'session_error'].includes(e.type)))
      .subscribe(_ => this._navigateToLoginPage());

  }

  // =====================
  // login sequence
  // =====================

  public login(urlState?: string): Promise<void> {
    return this._oauthService
      .loadDiscoveryDocumentAndLogin({ state: urlState })
      .then(() => {
        this.isDoneLoadingSubject$.next(true);

        if (this._oauthService.hasValidAccessToken()) {
          this._userService.loadUserProfile();
          this._startExpiryTimer();
        }

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
    const expiry = this._oauthService.getAccessTokenExpiration();
    const current = new Date().getTime();
    const fullTime = expiry - current;
    const eightyTime = fullTime * .80;

    const fullTimeout = setTimeout(() => {
      window.alert('TIME IS UP!');
      this._oauthService.logOut();
      setTimeout(() => this.login(this._router.url), 500);
    }, fullTime);

    setTimeout(() => {
      const confirm = window.confirm('TIME IS ALMOST UP! Click OK to refresh your session.');
      if (confirm) {
        this._oauthService.logOut();
        clearTimeout(fullTimeout);
        setTimeout(() => this.login(this._router.url), 500);
      }
    }, eightyTime);

    this.refreshTokenCountdown = interval(1000)
      .pipe(
        mapTo(-1000),
        scan((acc: number, curr: number) => acc + curr, fullTime),
        takeWhile(val => val >= 0)
      );
  }

}
