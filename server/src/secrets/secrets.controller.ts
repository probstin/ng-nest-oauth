import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('secrets')
export class SecretsController {

    @Get()
    getNonSecret() {
        return { message: "This isn't a secret" };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/secret')
    getSecret(): any {
        return { message: "Shhhh, it's a secret" };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/userProfile')
    getUserProfile(): any {
        return { username: "Shhhh, it's a secret" };
    }

}
