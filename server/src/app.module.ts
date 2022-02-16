import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SecretsController } from './secrets/secrets.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule
  ],
  controllers: [
    SecretsController
  ]
})
export class AppModule { }
