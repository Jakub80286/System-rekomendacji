import { Module } from "@nestjs/common";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";
import { VisionService } from "./vision.service";


@Module({
    controllers: [PhotoController],
    providers: [PhotoService, VisionService],
})
export class PhotoModule {}