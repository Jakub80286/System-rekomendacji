import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagService } from './tag.service';
import { Role } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { editTagDto } from './dto/edit-tag.dto';

@UseGuards(JwtGuard)
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Post()
  createPhoto(
    @GetUser('id') userId: number,
    @GetUser('role') userRole: Role,
    @Body() dto: CreateTagDto,
  ) {
    return this.tagService.createTag(userId, dto);
  }

  @Patch(':tag_id')
  editTag(
    @GetUser('id') userId: number,
    @GetUser('role') userRole: Role,
    @Param('tag_id', ParseIntPipe) tagId: number,
    @Body() dto: editTagDto,
  ) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Nie masz do tego uprawnien');
    }
    return this.tagService.editTag(tagId, dto);
  }

  @Delete(':tag_id')
  deleteTag(
    @GetUser('role') userRole: Role,
    @Param('tag_id', ParseIntPipe) tagId: number,
  ) {
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('Nie masz do tego uprawnien');
    }
    return this.tagService.deleteTag(tagId);
  }

  @Get(':tag_id')
  getPhotoById(@Param('tag_id', ParseIntPipe) tagId: number) {
    return this.tagService.getTagById(tagId);
  }
}
