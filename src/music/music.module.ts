import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify-api.service';
import { MusicController } from './music.controller';
import { HttpModule } from '@nestjs/axios';
import { SpotifyStrategy } from './music.strategy';
import { MusicService } from './music.service';
import { RecommendationService } from './recommendation.service';
import { CollaborativeFiltering } from './collaborative-filtering.service';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
    imports: [ HttpModule, CacheModule.register({
      ttl: 20,
      max: 100, 
    })],
    controllers: [ MusicController],
    providers: [ SpotifyStrategy, SpotifyService, MusicService, RecommendationService, CollaborativeFiltering ]
  })
export class MusicModule {}
