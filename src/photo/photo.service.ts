import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { EditPhotoDto } from './dto';
import { VisionService } from './vision.service';
import axios from 'axios';
import imageSize from 'image-size';
import { rgbToCIELAB } from './colorConversion';

@Injectable()
export class PhotoService {
  constructor(
    private prisma: PrismaService,
    private visionService: VisionService,
  ) {}

  getPhotos(userId: number) {
    return this.prisma.photo.findMany({
      where: {
        userId,
      },
    });
  }

  getPhotokById(userId: number, photoId: number) {
    return this.prisma.photo.findFirst({
      where: {
        photo_id: photoId,
        userId,
      },
    });
  }

  getPhoto(userId: number) {
    return this.prisma.photo.findMany({
      where: {
        userId,
      },
    });
  }

  async createPhoto(userId: number, dto: CreatePhotoDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik o podanym ID nie istnieje');
    }

    const existingPhotoWithSameTitle = await this.prisma.photo.findFirst({
      where: {
        title: dto.title,
      },
    });

    if (existingPhotoWithSameTitle) {
      throw new BadRequestException('Zdjęcie o podanym tytule już istnieje');
    }

    const existingTags = await this.prisma.tag.findMany({
      where: {
        tag_id: {
          in: dto.tagIds,
        },
      },
    });

    if (existingTags.length !== dto.tagIds.length) {
      throw new BadRequestException('Niektóre z podanych tagów nie istnieją');
    }
    const { width, height } = await this.getImageSize(dto.url);

    const newPhoto = await this.prisma.photo.create({
      data: {
        title: dto.title,
        description: dto.description,
        url: dto.url,
        width,
        height,
        userId,
        photoTags: {
          create: dto.tagIds.map((tagId) => ({
            tag: {
              connect: { tag_id: tagId },
            },
          })),
        },
      },
    });

    const analysisResults = await this.visionService.analyzeImage(dto.url);
    for (const { description, score } of analysisResults.labels) {
      let labelImg = await this.prisma.label.findUnique({
        where: { name: description },
      });

      if (!labelImg) {
        labelImg = await this.prisma.label.create({
          data: { name: description },
        });
      }
      await this.prisma.feature.create({
        data: {
          photo_id: newPhoto.photo_id,
          labelId: labelImg.id,
          red: 0,
          green: 0,
          blue: 0,
          score: score,
          pixelFraction: 0,
        },
      });
    }
    const colorsImg = analysisResults.colors.map((color) => ({
      photo_id: newPhoto.photo_id,
      red: color.color.red,
      green: color.color.green,
      blue: color.color.blue,
      score: color.score,
      pixelFraction: color.pixelFraction,
    }));

    if (colorsImg.length > 0) {
      await this.prisma.feature.createMany({
        data: colorsImg,
      });
    }
    return newPhoto;
  }

  async editPhoto(userId: number, photoId: number, editPhotoDto: EditPhotoDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik o podanym ID nie istnieje');
    }

    const photo = await this.prisma.photo.findUnique({
      where: {
        photo_id: photoId,
        userId,
      },
    });

    if (!photo) {
      throw new NotFoundException('Zdjęcie o podanym ID nie istnieje');
    }

    const updatedPhoto = await this.prisma.photo.update({
      where: {
        photo_id: photoId,
      },
      data: {
        title:
          editPhotoDto.title !== undefined ? editPhotoDto.title : photo.title,
        description:
          editPhotoDto.description !== undefined
            ? editPhotoDto.description
            : photo.description,
        url: editPhotoDto.url !== undefined ? editPhotoDto.url : photo.url,
      },
    });

    if (editPhotoDto.tagIds !== undefined && editPhotoDto.tagIds.length > 0) {
      await this.prisma.photoTag.deleteMany({
        where: {
          photo_id: photoId,
        },
      });

      await this.prisma.photoTag.createMany({
        data: editPhotoDto.tagIds.map((tagId) => ({
          photo_id: photoId,
          tag_id: tagId,
        })),
      });
    }

    return updatedPhoto;
  }

  async deletePhoto(userId: number, photoId: number) {
    const photo = await this.prisma.photo.findUnique({
      where: {
        photo_id: photoId,
      },
    });

    if (!photo || photo.userId !== userId)
      throw new ForbiddenException('Nie mozna usunac zdjecia');

    await this.prisma.photo.delete({
      where: {
        photo_id: photoId,
      },
    });
  }

  async addLike(userId: number, photoId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Użytkownik o podanym ID nie istnieje');
    }

    const photo = await this.prisma.photo.findUnique({
      where: {
        photo_id: photoId,
      },
    });

    if (!photo) {
      throw new NotFoundException('Zdjęcie o podanym ID nie istnieje');
    }

    const existingLike = await this.prisma.like.findFirst({
      where: {
        user_id: userId,
        photo_id: photoId,
      },
    });

    if (existingLike) {
      throw new BadRequestException('Użytkownik już polubił to zdjęcie');
    }

    const newLike = await this.prisma.like.create({
      data: {
        user_id: userId,
        photo_id: photoId,
      },
    });

    return newLike;
  }

  async getImageSize(
    imageUrl: string,
  ): Promise<{ width: number; height: number }> {
    const response = await axios({
      url: imageUrl,
      responseType: 'arraybuffer',
    });

    const sizeImg = imageSize(response.data);

    return { width: sizeImg.width, height: sizeImg.height };
  }

  async getPhotoColorsInCIELAB(photoId: number) {
    const features = await this.prisma.feature.findMany({
      where: { photo_id: photoId },
      select: {
        red: true,
        green: true,
        blue: true,
      },
    });

    const colorsInCIELAB = features
      .filter(
        (feature) =>
          feature.red != null && feature.green != null && feature.blue != null,
      )
      .map(({ red, green, blue }) => {
        console.log('!!!!!!!!!!Konwersja rgb!!!!!!!!!!!!!!:', red, green, blue);
        return rgbToCIELAB(red, green, blue);
      });

    return colorsInCIELAB;
  }
}
