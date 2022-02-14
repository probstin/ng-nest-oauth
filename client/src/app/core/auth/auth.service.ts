import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, combineLatest, filter, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  private isDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

  public canActivateProtectedRoutes$: Observable<boolean> =
    combineLatest([this.isAuthenticated$, this.isDoneLoading$])
      .pipe(map((values: any) => values.every((b: any) => b)));

  constructor(private _oauthService: OAuthService, private _router: Router) {
    this._oauthService.events
      .subscribe(_ => this.isAuthenticatedSubject$.next(this._oauthService.hasValidAccessToken()));

    this._oauthService.events
      .pipe(filter((e: any) => ['token_received'].includes(e.type)))
      .subscribe((e: any) => this._oauthService.loadUserProfile());
  }

  // =====================
  // login sequences
  // =====================

  public login(targetUrl?: string) {
    // Note: before version 9.1.0 of the angular-oauth2-oidc library you needed to
    // call encodeURIComponent on the argument to the method.
    this._oauthService.initLoginFlow(targetUrl || this._router.url);
  }

  public runInitialLoginSequence(): Promise<void> {

    // 0. LOAD CONFIG:
    // First we have to check to see how the IdServer is
    // currently configured:
    return this._oauthService.loadDiscoveryDocument()

      // For demo purposes, we pretend the previous call was very slow
      .then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 1000)))

      // 1. HASH LOGIN:
      // Try to log in via hash fragment after redirect back
      // from IdServer from initImplicitFlow:
      .then(() => this._oauthService.tryLogin())

      .then(() => {
        if (this._oauthService.hasValidAccessToken()) {
          return Promise.resolve();
        }

        // 2. SILENT LOGIN:
        // Try to log in via a refresh because then we can prevent
        // needing to redirect the user:
        return this._oauthService.silentRefresh()
          .then(() => Promise.resolve())
          .catch(result => {
            // Subset of situations from https://openid.net/specs/openid-connect-core-1_0.html#AuthError
            // Only the ones where it's reasonably sure that sending the
            // user to the IdServer will help.
            const errorResponsesRequiringUserInteraction = [
              'interaction_required',
              'login_required',
              'account_selection_required',
              'consent_required',
            ];

            if (result
              && result.reason
              && errorResponsesRequiringUserInteraction.indexOf(result.reason.error) >= 0) {

              // 3. ASK FOR LOGIN:
              // At this point we know for sure that we have to ask the
              // user to log in, so we redirect them to the IdServer to
              // enter credentials.
              //
              // Enable this to ALWAYS force a user to login.
              // this.login();
              //
              // Instead, we'll now do this:
              console.warn('User interaction is needed to log in, we will wait for the user to manually log in.');
              return Promise.resolve();
            }

            // We can't handle the truth, just pass on the problem to the
            // next handler.
            return Promise.reject(result);
          });
      })
      .then(() => {
        this.isDoneLoadingSubject$.next(true);

        // Check for the strings 'undefined' and 'null' just to be sure. Our current
        // login(...) should never have this, but in case someone ever calls
        // initImplicitFlow(undefined | null) this could happen.
        if (this._oauthService.state && this._oauthService.state !== 'undefined' && this._oauthService.state !== 'null') {
          let stateUrl = this._oauthService.state;
          if (stateUrl.startsWith('/') === false) {
            stateUrl = decodeURIComponent(stateUrl);
          }
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
  public get refreshToken() { return this._oauthService.getRefreshToken(); }
  public get idToken() { return this._oauthService.getIdToken(); }
  public get logoutUrl() { return this._oauthService.logoutUrl; }
}
