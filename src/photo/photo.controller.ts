import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PhotoService } from './photo.service';
import { RecommendationPhotoService } from './recommendation.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditPhotoDto } from './dto';
import { VisionService } from './vision.service';
import { RecommendationTagsService } from './tag-recommendation.service';

@UseGuards(JwtGuard)
@Controller('photo')
export class PhotoController {
  constructor(
    private photoService: PhotoService,
    private visionService: VisionService,
    private recommendationPhotoService: RecommendationPhotoService,
    private recommendation: RecommendationTagsService,
  ) {}

  @Post()
  createPhoto(@GetUser('id') userId: number, @Body() dto: CreatePhotoDto) {
    return this.photoService.createPhoto(userId, dto);
  }
  @Get('analyze')
  async analyzeImage(@Query('imageUrl') imageUrl: string) {
    return this.visionService.analyzeImage(imageUrl);
  }
  @Get()
  getPhotos(
    @GetUser('id') userId: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.photoService.getPhoto(userId);
  }

  @Get(':photo_id')
  getPhotoById(
    @GetUser('id') userId: number,
    @Param('photo_id', ParseIntPipe) photoId: number,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
  ) {
    return this.photoService.getPhotokById(userId, photoId);
  }

  @Patch(':photo_id')
  editPhoto(
    @GetUser('id') userId: number,
    @Param('photo_id', ParseIntPipe) photoId: number,
    @Body() dto: EditPhotoDto,
  ) {
    return this.photoService.editPhoto(userId, photoId, dto);
  }

  @Delete(':photo_id')
  deletePhoto(
    @GetUser('id') userId: number,
    @Param('photo_id', ParseIntPipe) photoId: number,
  ) {
    return this.photoService.deletePhoto(userId, photoId);
  }

  @Post(':photo_id/like')
  addLike(
    @GetUser('id') userId: number,
    @Param('photo_id', ParseIntPipe) photoId: number,
  ) {
    return this.photoService.addLike(userId, photoId);
  }

  @Get(':photo_id/colors-in-cielab')
  async getColorsInCIELAB(@Param('photo_id', ParseIntPipe) photoId: number) {
    const colorsInCIELAB =
      await this.photoService.getPhotoColorsInCIELAB(photoId);
    return { colorsInCIELAB };
  }

  @Get('recommendation/:user_id')
  async getPhotoRecommendation(@GetUser('id') userId: number) {
    return this.recommendationPhotoService.recommendBasedOnLabes(userId);
  }

  @Get('recommendations/:user_id')
  async getPhotoRecommen(@GetUser('id') userId: number) {
    return this.recommendation.recommendationBasedOnTags(userId);
  }
}
