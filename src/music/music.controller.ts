import { Controller, Param, Get, UseGuards } from "@nestjs/common";
import { SpotifyService } from "./music.service";
import { JwtGuard } from "../auth/guard/jwt.guard";

@Controller('music')
export class AlbumsController {
  constructor(private readonly spotifyService: SpotifyService) {}

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

  

}
