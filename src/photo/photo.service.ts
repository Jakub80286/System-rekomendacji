import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { EditPhotoDto } from './dto';

@Injectable()
export class PhotoService {
    constructor(private prisma: PrismaService){}

    getPhotos(userId: number){
        return this.prisma.photo.findMany({
            where: {
                userId
            },
        },
        )};

        getPhotokById(
            userId: number,
            photoId: number,
          ) {
            return this.prisma.photo.findFirst({
              where: {
                photo_id: photoId,
                userId,
              },
            });
          }


        async createPhoto(userId: number, dto: CreatePhotoDto){
            const photo = await this.prisma.photo.create({
                data: {
                    userId,
                    ...dto
                }
            });
            return photo;
        }
        
        getPhoto(userId: number) {
            return this.prisma.photo.findMany({
              where: {
                userId,
              },
            });
          }

        
        async editPhoto(userId: number, photoId: number, dto: EditPhotoDto){
            
            const photo = await this.prisma.photo.findUnique({
                where: {
                    photo_id: photoId
                },
            });
            
            if(photo.userId !== userId || !photo)
            throw new ForbiddenException ('Edycja nie jest mozliwa');

            return this.prisma.photo.update({
                where: {
                    photo_id: photoId
                },
                data: {
                    ...dto,
                },
            });
  
        }

        async deletePhoto(userId: number, photoId: number){

            const photo = await this.prisma.photo.findUnique({
                where: {
                    photo_id: photoId
                }
            })
            
            if( !photo || photo.userId !== userId )
            throw new ForbiddenException('nie mozna usunac zdjecia')

            await this.prisma.photo.delete({
                where: {
                    photo_id: photoId
                }
            });
        }














    }






        

        



