import { Module } from "@nestjs/common";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";
import { VisionService } from "./vision.service";
import { RecommendationPhotoService } from "./recommendation.service";
import { RecommendationTagsService } from "./tag-recommendation.service";


@Module({
    controllers: [PhotoController],
    providers: [PhotoService, VisionService, RecommendationPhotoService, RecommendationTagsService],
})
export class PhotoModule {}