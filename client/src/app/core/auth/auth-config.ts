import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
    issuer: 'https://dev-y-t10xkr.us.auth0.com/',
    clientId: 'kkAyXeYDFTmKinPxYs5ZxdnZb65erQp8',
    responseType: 'code',
    redirectUri: window.location.origin + '/',
    scope: 'openid profile email offline_access',
    customQueryParams: { audience: 'http://localhost:3001/api/' },
    showDebugInformation: true
};
