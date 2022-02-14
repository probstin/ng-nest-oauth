import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SecretsController } from './secrets/secrets.controller';
import { AuthoModule } from './autho/autho.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot(),
    AuthoModule
  ],
  controllers: [AppController, SecretsController],
  providers: [AppService],
})
export class AppModule { }
