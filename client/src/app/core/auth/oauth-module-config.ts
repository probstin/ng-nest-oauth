import { OAuthModuleConfig } from 'angular-oauth2-oidc';

export const oAuthModuleConfig: OAuthModuleConfig = {
  resourceServer: {
    allowedUrls: ['http://localhost:3000'],
    sendAccessToken: true,
  }
};
