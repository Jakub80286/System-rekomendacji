import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MusicService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getMusickById(musicId: string) {
    return this.prisma.song.findFirst({
      where: {
        id: musicId,
      },
    });
  }

  async addLike(musicId: string, userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new BadRequestException('Podany użytkownik nie istnieje');
      }

      const music = await this.prisma.song.findUnique({
        where: {
          id: musicId,
        },
      });

      if (!music) {
        throw new BadRequestException(
          'Podany utwór nie istnieje lub jest nieprawidłowy',
        );
      }

      const existingLike = await this.prisma.like.findFirst({
        where: {
          user_id: userId,
          song_id: musicId,
        },
      });

      if (existingLike) {
        throw new BadRequestException('Użytkownik już polubił dany utwór');
      }

      const newLike = await this.prisma.like.create({
        data: {
          user_id: userId,
          song_id: musicId,
        },
      });

      const cacheKey = `recommendations-${userId}`;
      await this.cacheManager.del(cacheKey);

      return newLike;
    } catch (error) {
      console.error('!!!!!!Błąd przy polubieniu!!!!!!!!:', error);
      throw new BadRequestException('Nie można dodać polubienia.');
    }
  }
}
