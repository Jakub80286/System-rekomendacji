import { Module } from '@nestjs/common';
import { SpotifyService } from './music.service';
import { AlbumsController } from './music.controller';
import { HttpModule } from '@nestjs/axios';
import { SpotifyStrategy } from './music.strategy';

@Module({
    imports: [ HttpModule],
    controllers: [ AlbumsController],
    providers: [ SpotifyStrategy, SpotifyService]
  })
export class MusicModule {}
