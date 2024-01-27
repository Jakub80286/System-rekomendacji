import { ArrayMinSize, IsInt, IsOptional, IsString } from "class-validator"

export class EditPhotoDto{

    @IsString()
    @IsOptional()
    title?: string
    
    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsOptional()
    url?: string

    @IsOptional()
    @IsInt({ each: true})
    @ArrayMinSize(1)
    tagIds?: number[] ;
}