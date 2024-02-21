import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-spotify';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class SpotifyStrategy extends PassportStrategy(Strategy, 'spotify') {
  constructor(private readonly configService: ConfigService,) {
    super({
      clientID: configService.get('SPOTIFY_CLIENT_ID'),
      clientSecret: configService.get('SPOTIFY_CLIENT_SECRET'),
      callbackURL: configService.get('SPOTIFY_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    if (!profile) {
      throw new UnauthorizedException();
    }

    
    const validatedData = {
      userId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      email: profile.emails ? profile.emails[0].value : null,
      accessToken,
      refreshToken,
    };
  
  
    return validatedData;
  }
  }


