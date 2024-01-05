import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { EditPhotoDto } from './dto';

@UseGuards(JwtGuard)
@Controller('photo')
export class PhotoController {
    constructor(private photoService: PhotoService){}
    
    @Post()
    createPhoto(@GetUser('id') userId: number, @Body() dto: CreatePhotoDto){
        return this.photoService.createPhoto(userId, dto)
    }

    @Get()
    getPhotos(@GetUser('id') userId: number) {
      return this.photoService.getPhoto(userId);
    }

    @Get(':photo_id')
    getPhotoById(@GetUser('id') userId: number, @Param('photo_id', ParseIntPipe) photoId: number){
      return this.photoService.getPhotokById(userId, photoId);
    }

    @Patch(':photo_id')
    editPhoto(@GetUser('id') userId: number, @Param('photo_id', ParseIntPipe) photoId: number, @Body() dto: EditPhotoDto) {
      return this.photoService.editPhoto(userId, photoId, dto);
    }

    @Delete(':photo_id')
    deletePhoto(@GetUser('id') userId: number, @Param('photo_id', ParseIntPipe) photoId: number){
      return this.photoService.deletePhoto(userId, photoId);
    }



}
