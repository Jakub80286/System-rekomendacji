import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { editTagDto } from './dto/edit-tag.dto';

@Injectable()
export class TagService {
    constructor(private prisma: PrismaService){}
    

    async createTag(userId: number, dto: CreateTagDto){
        const tag = await this.prisma.tag.create({
            data: {
                userId,
                ...dto
            }
        });
        return tag;
    }

    async editTag(tagId: number, dto: editTagDto){
            
        const tag = await this.prisma.tag.findUnique({
            where: {
                tag_id: tagId
            },
        });

        return this.prisma.tag.update({
            where: {
                tag_id: tagId
            },
            data: {
                ...dto,
            },
        });

    }


    async deleteTag( tagId: number){

        const tag = await this.prisma.tag.findUnique({
            where: {
                tag_id: tagId
            }
        })
        
        await this.prisma.tag.delete({
            where: {
                tag_id: tagId
            }
        });
    }

    getTagById(
        tagId: number,
      ) {
        return this.prisma.tag.findFirst({
          where: {
            tag_id: tagId,
          },
        });
      }


      

}

