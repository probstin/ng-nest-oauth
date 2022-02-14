import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthoModule } from 'src/autho/autho.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }), 
        AuthoModule
    ],
    providers: [JwtStrategy],
    exports: [PassportModule, JwtStrategy]
})
export class AuthModule { }
