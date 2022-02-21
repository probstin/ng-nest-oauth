import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { AuthConfig, OAuthModule, OAuthModuleConfig, OAuthStorage } from 'angular-oauth2-oidc';
import { authConfig } from './auth/auth-config';
import { AuthGuard } from './auth/auth-guard.service';
import { authInitializerFactory } from './auth/factories/auth-initializer.factory';
import { AuthService } from './auth/auth.service';
import { oAuthModuleConfig } from './auth/oauth-module-config';
import { storageFactory } from './auth/factories/local-storage.factory';

@NgModule({
  imports: [
    HttpClientModule,
    OAuthModule.forRoot()
  ],
  providers: [
    AuthService,
    AuthGuard
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        {
          provide: APP_INITIALIZER,
          useFactory: authInitializerFactory,
          deps: [AuthService],
          multi: true
        },
        { provide: OAuthStorage, useFactory: storageFactory },
        { provide: AuthConfig, useValue: authConfig },
        { provide: OAuthModuleConfig, useValue: oAuthModuleConfig }
      ]
    };
  }

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
