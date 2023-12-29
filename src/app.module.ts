import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PhotoController } from './photo/photo.controller';
import { PhotoService } from './photo/photo.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }),UserModule, PrismaModule, AuthModule],
  controllers: [PhotoController],
  providers: [PhotoService],
})
export class AppModule {}
