import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PhotoModule } from './photo/photo.module';
import { TagModule } from './tag/tag.module';
import { MusicModule } from './music/music.module';




@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, 
  }),UserModule, PrismaModule, AuthModule, PhotoModule, TagModule, MusicModule],
})
export class AppModule{}

