import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios'; 
import { AxiosResponse } from 'axios'; 
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SpotifyService {
  private accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private prisma: PrismaService
  ) {}

  async getAccessToken(): Promise<string> {
    const client_id = this.configService.get('SPOTIFY_CLIENT_ID');
    const client_secret = this.configService.get('SPOTIFY_CLIENT_SECRET');
    
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      form: {
        grant_type: 'client_credentials'
      },
      json: true
    };

    try {
      const response = await this.httpService.post(authOptions.url, null, {
        headers: authOptions.headers,
        params: authOptions.form,
      }).toPromise();

      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      throw new UnauthorizedException('Nie można uzyskać tokena dostępu.');
    }
  }

  async getAlbumInfo(albumId: string): Promise<AxiosResponse<any>> {

    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const apiUrl = `https://api.spotify.com/v1/albums/${albumId}`;
    
    try {
      const response = await this.httpService.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).toPromise();

      return response.data; 
    } catch (error) {
      throw new Error('Nie można pobrać informacji o albumie.');
    }
  }

 
  async getTrackInfo(trackId: string): Promise<AxiosResponse<any>> {

    if (!this.accessToken) {
      await this.getAccessToken();
    }

    const apiUrl = `https://api.spotify.com/v1/tracks/${trackId}`;
    
    try {
      const response = await this.httpService.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).toPromise();
      

      const { name } = response.data;
      const existingSong = await this.prisma.song.findUnique({
        where: { id: trackId },
      });
 if (existingSong) {
      await this.prisma.song.update({
        where: { id: trackId },
        data: { name },
      });
    }


      return response.data; 
    } catch (error) {
      throw new Error('Nie można pobrać informacji o utworze.');
    }
  }




  async getAudioInfo(trackId: string): Promise<AxiosResponse<any>> {
    if (!this.accessToken) {
      await this.getAccessToken();
    }
  
    const audioUrl = `https://api.spotify.com/v1/audio-features/${trackId}`;
    const trackUrl = `https://api.spotify.com/v1/tracks/${trackId}`;
  
    try {
   
      const responseAudio = await this.httpService.get(audioUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).toPromise();
  
    
      const responseTrack = await this.httpService.get(trackUrl, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }).toPromise();
  
      await this.saveSongInfo(responseAudio.data);
      

      await this.prisma.song.update({
        where: { id: trackId },
        data: {
          name: responseTrack.data.name,
          popularity: responseTrack.data.popularity,
        },
      });
  
      const { artists } = responseTrack.data;
     
     for (const artist of artists){
      const artistId=artist.id
      const existingArtist = await this.prisma.artist.findUnique({
        where: { id: artistId },
      });
  
      if (!existingArtist) {
        
        const artistInfoUrl = `https://api.spotify.com/v1/artists/${artistId}`;
        const artistInfoResponse = await this.httpService.get(artistInfoUrl, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }).toPromise();
  
        
        await this.saveArtistInfo(artistInfoResponse.data);
      }
    
  
      const existingSongArtist = await this.prisma.songArtist.findFirst({
        where: {
          artist_id: artistId,
          song_id: trackId,
        },
      });
  
      if (!existingSongArtist) {
        await this.prisma.songArtist.create({
          data: {
            artist_id: artistId,
            song_id: trackId,
          },
        });
      }
    }
      return responseAudio.data;
    } catch (error) {
      console.error('Błąd podczas pobierania informacji o utworze:', error.response?.data || error.message);
      throw new Error('Nie można pobrać informacji o utworze.');
    }
  }
  

async saveArtistInfo(artistData: any): Promise<void> {
  await this.prisma.artist.create({
    data: {
      id: artistData.id,
      name: artistData.name,
      popularity: artistData.popularity,
      genres: artistData.genres,
      followers: artistData.followers.total
    }

  })
}


async saveSongInfo(songData: any ): Promise<void> {
   
  await this.prisma.song.create({
    data: {
      id: songData.id,
      danceability: songData.danceability,
      energy: songData.energy,
      key: songData.key,
      loudness: songData.loudness,
      mode: songData.mode,
      speechiness: songData.speechiness,
      acousticness: songData.acousticness,
      instrumentalness: songData.instrumentalness,
      liveness: songData.liveness,
      valence: songData.valence,
      tempo: songData.tempo,
      duration_ms: songData.duration_ms,
      time_signature: songData.time_signature,
      name: songData.name,
      popularity: songData.popularity
    },
  });
}
}
