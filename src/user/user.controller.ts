import {
    Body,
    Controller,
    Get,
    Patch,
    UseGuards,
  } from '@nestjs/common';
  import { User } from '@prisma/client';
  import { GetUser } from '../auth/decorator';
  import { JwtGuard } from '../auth/guard';
  
  
  @UseGuards(JwtGuard)
  @Controller('users')
  export class UserController {
   
    @Get('me')
    getMe(@GetUser() user: User,
    @GetUser('id') id: string) {
      console.log({id});
      return user;
    } 
  }