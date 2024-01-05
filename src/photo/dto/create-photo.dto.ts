import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePhotoDto {

    @IsString()
    @IsNotEmpty()    
    title: string

    @IsOptional()
    @IsString()
    description: string

    @IsString()
    @IsNotEmpty()
    url: string
}