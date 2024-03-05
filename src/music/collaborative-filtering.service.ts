import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class CollaborativeFiltering {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async recommendationCF(userId: number): Promise<any[]> {
    const cacheKey = `recommendations-${userId}`;
    const cached: any[] = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const userLikes = await this.prisma.like.findMany({
      where: { user_id: userId },
      select: { song_id: true },
    });
    const likedSongIds = userLikes.map((like) => like.song_id);

    const similarUsersLikes = await this.prisma.like.findMany({
      where: {
        song_id: { in: likedSongIds },
        user_id: { not: userId },
      },
      select: { user_id: true, song_id: true },
    });

    const similarityScores = similarUsersLikes.reduce((acc, curr) => {
      acc[curr.user_id] = (acc[curr.user_id] || 0) + 1;
      return acc;
    }, {});

    const mostSimilarUserIds = Object.keys(similarityScores)
      .sort((a, b) => similarityScores[b] - similarityScores[a])
      .slice(0, 5);

    if (mostSimilarUserIds.length) {
      const recommendations = await this.prisma.like.findMany({
        where: {
          user_id: { in: mostSimilarUserIds.map((id) => Number(id)) },
          song_id: { notIn: likedSongIds },
        },
        select: {
          song_id: true,
          song: {
            select: {
              name: true,
            },
          },
        },
        distinct: ['song_id'],
      });
      await this.cacheManager.set(cacheKey, recommendations, 300);
      return recommendations.map((rec) => ({
        song_id: rec.song_id,
        title: rec.song.name,
      }));
    }

    return [];
  }
}
