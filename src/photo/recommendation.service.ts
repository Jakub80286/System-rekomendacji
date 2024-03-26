import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { rgbToCIELAB } from './colorConversion';
import { Photo } from '@prisma/client';

@Injectable()
export class RecommendationPhotoService {
  constructor(private prismaService: PrismaService) {}

  async recommendBasedOnLabes(userId: number): Promise<Photo[]> {
    const likedPhotos = await this.prismaService.like.findMany({
      where: { user_id: userId },
      include: {
        photo: {
          include: {
            features: {
              include: {
                label: true,
              },
            },
          },
        },
      },
    });

    const likedLabelsScores = new Map<string, number>();
    const likedColorsCIELAB = [];

    likedPhotos.forEach(({ photo }) => {
      if (photo && photo.features) {
        photo.features.forEach((feature) => {
          if (feature.label) {
            likedLabelsScores.set(
              feature.label.name,
              likedLabelsScores.get(feature.label.name) || 0,
            );
          } else if (
            feature.red !== null &&
            feature.green !== null &&
            feature.blue !== null
          ) {
            likedColorsCIELAB.push(
              rgbToCIELAB(feature.red, feature.green, feature.blue),
            );
          }
        });
      }
    });

    const otherPhotosFeatures = await this.prismaService.feature.findMany({
      where: {
        photo: {
          NOT: {
            likes: {
              some: {
                user_id: userId,
              },
            },
          },
        },
      },
      include: {
        label: true,
        photo: true,
      },
    });

    const photosScores = new Map<
      number,
      {
        score: number;
        photo: Photo;
        totalScore: number;
        totalPixelFraction: number;
      }
    >();

    otherPhotosFeatures.forEach(
      ({ photo_id, red, green, blue, label, photo, score, pixelFraction }) => {
        let photoScores = photosScores.get(photo_id);

        if (!photoScores) {
          photoScores = {
            score: 0,
            photo,
            totalScore: 0,
            totalPixelFraction: 0,
          };
          photosScores.set(photo_id, photoScores);
        }

        if (red !== null && green !== null && blue !== null) {
          const colorCIELAB = rgbToCIELAB(red, green, blue);
          likedColorsCIELAB.forEach((likedColor) => {
            const colorDistance = this.calculateCIELABdistance(
              likedColor,
              colorCIELAB,
            );
            photoScores.score +=
              this.normalizeCIELABScore(colorDistance) * (pixelFraction ?? 0);
          });
        }

        if (label && likedLabelsScores.has(label.name)) {
          photoScores.score += likedLabelsScores.get(label.name) + 0.2;
        }

        photoScores.totalScore += score ?? 0;
        photoScores.totalPixelFraction += pixelFraction ?? 0;
      },
    );
    const sortedPhotos = Array.from(photosScores.values())
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.totalPixelFraction - a.totalPixelFraction ||
          b.totalScore - a.totalScore,
      )
      .slice(0, 10);
    return sortedPhotos.map(({ photo }) => photo);
  }

  private calculateCIELABdistance(
    color1: [number, number, number],
    color2: [number, number, number],
  ): number {
    const distance = Math.sqrt(
      Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2),
    );

    const minDistance = 1;
    const normalizedDistance = Math.max(distance, minDistance);
    return 1 / normalizedDistance;
  }

  private normalizeCIELABScore(distanceScore: number): number {
    return Math.log(1 + distanceScore);
  }
}
