import { Controller, Param, Get, UseGuards, Post } from '@nestjs/common';
import { SpotifyService } from './spotify-api.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorator';
import { MusicService } from './music.service';
import { RecommendationService } from './recommendation.service';
import { CollaborativeFiltering } from './collaborative-filtering.service';

@Controller('music')
export class MusicController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly musicService: MusicService,
    private readonly recommendaionService: RecommendationService,
    private readonly collabService: CollaborativeFiltering,
  ) {}

  @Get('albums/:albumId')
  async getAlbum(@Param('albumId') albumId: string): Promise<any> {
    try {
      const albumInfo = await this.spotifyService.getAlbumInfo(albumId);
      return albumInfo;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('tracks/:trackId')
  async getTracks(@Param('trackId') trackId: string): Promise<any> {
    try {
      const trackInfo = await this.spotifyService.getTrackInfo(trackId);
      return trackInfo;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('audio/:trackId')
  async getAudioInfo(@Param('trackId') trackId: string): Promise<any> {
    try {
      const audioInfo = await this.spotifyService.getAudioInfo(trackId);
      return audioInfo;
    } catch (error) {
      return { error: error.message };
    }
  }

  @UseGuards(JwtGuard)
  @Post(':song_id/like')
  async likeMusic(
    @Param('song_id') songId: string,
    @GetUser('id') userId: number,
  ) {
    return this.musicService.addLike(songId, userId);
  }

  @UseGuards(JwtGuard)
  @Get('recommendations')
  async getRecommendations(@GetUser('id') userId: number): Promise<any> {
    return this.recommendaionService.recommendSongs(userId);
  }

  @UseGuards(JwtGuard)
  @Get('recommendation')
  async collabRecom(@GetUser('id') userId: number): Promise<any> {
    return this.collabService.recommendationCF(userId);
  }
}
