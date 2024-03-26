import { Injectable } from '@nestjs/common';
import { Photo } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecommendationTagsService {
  constructor(private prisma: PrismaService) {}

  async recommendationBasedOnTags(userId: number): Promise<Photo[]> {
    const likedPhotosData = await this.prisma.like.findMany({
      where: { user_id: userId },
      select: {
        photo: {
          select: {
            width: true,
            height: true,
            photoTags: { select: { tag: true } },
          },
        },
      },
    });

    if (!likedPhotosData.length) {
      console.log('Nie znaleziono polubionych zdjęć.');
      return [];
    }

    let totalWidth = 0,
      totalHeight = 0,
      photosCount = 0,
      likedTagCountMap = new Map();
    for (const { photo } of likedPhotosData) {
      if (photo) {
        totalWidth += photo.width;
        totalHeight += photo.height;
        photosCount++;
        photo.photoTags.forEach(({ tag }) => {
          likedTagCountMap.set(
            tag.tag_id,
            (likedTagCountMap.get(tag.tag_id) || 0) + 1,
          );
        });
      }
    }

    const averageWidth = totalWidth / photosCount;
    const averageHeight = totalHeight / photosCount;

    let photoScores = new Map();
    for (const [tagId, likedTagCount] of likedTagCountMap.entries()) {
      const photos = await this.prisma.photo.findMany({
        where: {
          photoTags: { some: { tag_id: tagId } },
          NOT: { likes: { some: { user_id: userId } } },
        },
        select: { photo_id: true },
      });

      photos.forEach(({ photo_id }) => {
        const currentScore = photoScores.get(photo_id) || 0;
        photoScores.set(photo_id, currentScore + likedTagCount);
      });
    }

    let photosWithScoresAndTags = [];
    for (const [photoId, preferenceScore] of photoScores.entries()) {
      const photoDetails = await this.prisma.photo.findUnique({
        where: { photo_id: photoId },
        select: {
          photoTags: { select: { tag_id: true } },
          width: true,
          height: true,
        },
      });

      if (photoDetails) {
        const matchingTagsCount = photoDetails.photoTags.filter(({ tag_id }) =>
          likedTagCountMap.has(tag_id),
        ).length;
        const sizeDifference =
          Math.abs(photoDetails.width - averageWidth) +
          Math.abs(photoDetails.height - averageHeight);
        const sizeScore = 1 / (1 + sizeDifference / 100);
        const totalScore = preferenceScore + sizeScore;
        photosWithScoresAndTags.push({
          photoId,
          score: totalScore,
          commonTagsCount: matchingTagsCount,
        });
      }
    }

    photosWithScoresAndTags.sort(
      (a, b) => b.score - a.score || b.commonTagsCount - a.commonTagsCount,
    );

    const recommendedPhotos = [];
    for (const { photoId, score, commonTagsCount } of photosWithScoresAndTags) {
      const photo = await this.prisma.photo.findUnique({
        where: { photo_id: photoId },
      });
      if (photo) {
        recommendedPhotos.push({ photo, score: score, commonTagsCount });
      }
    }

    return recommendedPhotos;
  }
}
