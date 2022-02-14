import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor() {
        console.log(process.env.AUTH0_DOMAIN)
        console.log(process.env.AUTH0_AUDIENCE)

        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${process.env.AUTH0_DOMAIN}.well-known/jwks.json`,
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `${process.env.AUTH0_DOMAIN}`,
            algorithms: ['RS256'],
        });
    }

    validate(payload: any): any {
        console.log('HIT ME');
        
        const minimumScope = ['openid', 'profile', 'email'];

        if (
            payload?.scope
                ?.split(' ')
                .filter((scope) => minimumScope.indexOf(scope) > -1).length !== 3
        ) {
            throw new UnauthorizedException(
                'JWT does not possess the required scope (`openid profile email`).',
            );
        }

        return payload;
    }
}