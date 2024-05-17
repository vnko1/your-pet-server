import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  Res,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';

import {
  CreateUserDto,
  createUserSchema,
} from 'src/modules/users/dto/users.dto';

import { MongooseExceptionFilter, ZodValidationPipe } from 'src/common';
import { AuthService } from '../service/auth.service';
import { SignInDto, signInSchema } from '../dto/signIn.dto';
import { RTokenGuard } from '../guard/rToken.guard';

type Cred = { access_token: string; refresh_token: string };

@Controller('auth')
@UseFilters(MongooseExceptionFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.authService.signUp(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(signInSchema))
  async signIn(@Body() signInDto: SignInDto, @Res() res: Response) {
    const cred = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    return this.genResponse(res, cred, +process.env.REFRESH_TOKEN_AGE);
  }

  @UseGuards(RTokenGuard)
  @Post('refresh')
  @HttpCode(200)
  async refreshAToken(@Request() req, @Res() res: Response) {
    const cred = await this.authService.createCred({ sub: req.user.id });

    return this.genResponse(res, cred, +process.env.REFRESH_TOKEN_AGE);
  }

  private genResponse(res: Response, cred: Cred, maxAge: number) {
    res.cookie('refresh_token', cred.refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge,
    });
    return res.send({ access_token: cred.access_token });
  }
}
