import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async recommendSongs(userId: number): Promise<any[]> {
    const userFavoriteGenres = await this.getFavouriteGenres(userId);

    const likedSongs = await this.prisma.like.findMany({
      where: { user_id: userId },
      include: { song: true },
    });
    const likedSongIds = likedSongs.map((like) => like.song?.id);

    const allSongs = await this.prisma.song.findMany({
      include: { songArtists: { include: { artist: true } } },
    });
    const normalizedAllSongs = allSongs.map((song) =>
      this.normalizeSongs(song),
    );

    let recommendations = await Promise.all(
      normalizedAllSongs.map(async (normalizedSong) => {
        if (likedSongIds.includes(normalizedSong.id)) {
          return null;
        }

        let similarityScore = 0;
        let genreMatchScore = await this.calculateGenreScore(
          userFavoriteGenres,
          normalizedSong.songArtists.flatMap(
            (songArtist) => songArtist.artist.genres,
          ),
        );

        for (const likedSong of likedSongs) {
          if (likedSong.song) {
            const normalizedLikedSong = this.normalizeSongs(likedSong.song);
            similarityScore += this.calculateSimilarity(
              normalizedSong,
              normalizedLikedSong,
            );
          }
        }

        similarityScore =
          likedSongs.length > 0 ? similarityScore / likedSongs.length : 0;

        let finalScore = similarityScore + genreMatchScore;
        return { song: normalizedSong, score: finalScore };
      }),
    );

    recommendations = recommendations.filter(
      (recommendation) => recommendation !== null,
    );
    recommendations.sort((a, b) => b.score - a.score);

    return recommendations.slice(0, 30).map((recItem) => ({
      id: recItem.song.id,
      name: recItem.song.name,
      score: recItem.score,
    }));
  }

  private calculateSimilarity(song1: any, song2: any): number {
    const features = [
      'acousticness',
      'danceability',
      'loudness',
      'speechiness',
      'energy',
      'valence',
      'tempo',
      'popularity',
    ];
    let distance = 0;

    for (const feature of features) {
      distance += Math.pow(song1[feature] - song2[feature], 2);
    }

    return 1 / (1 + Math.sqrt(distance));
  }

  private normalizeSongs(song: any): any {
    return {
      ...song,
      key: (song.key + 1) / 12,
      loudness: (song.loudness + 60) / 60,
      tempo: song.tempo / 200,
      duration_ms: song.duration_ms / 300000,
      popularity: song.popularity / 100,
    };
  }

  async getFavouriteGenres(userId: number): Promise<string[]> {
    const genres = await this.prisma.like.findMany({
      where: { user_id: userId, song: { isNot: null } },
      select: {
        song: {
          select: {
            songArtists: {
              select: {
                artist: {
                  select: {
                    genres: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const genreSet = new Set<string>();
    genres.forEach((like) => {
      like.song.songArtists.forEach((songArtist) => {
        songArtist.artist.genres.forEach((genre) => {
          genreSet.add(genre);
        });
      });
    });

    return Array.from(genreSet);
  }

  private async calculateGenreScore(
    favGenres: string[],
    songGenres: string[],
  ): Promise<number> {
    const uniqueSongGenres = new Set(songGenres);
    let score = 0;

    for (const genre of favGenres) {
      if (uniqueSongGenres.has(genre)) {
        score = 0.1;
        break;
      }
    }
    return score;
  }
}
