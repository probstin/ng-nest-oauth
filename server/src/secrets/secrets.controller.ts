import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthoGuard } from 'src/autho/autho.guard';

@Controller('secrets')
export class SecretsController {

    @Get()
    getNonSecret() {
        return { message: "This isn't a secret" };
    }

    @UseGuards(AuthoGuard)
    @Get('/secret')
    getSecret(): any {
        return { message: "Shhhh, it's a secret" };
    }

}
