import { ArrayMinSize, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Length } from "class-validator";

export class CreatePhotoDto {

    @IsString()
    @Length(1, 50)
    @IsNotEmpty()    
    title: string

    @IsOptional()
    @Length(0, 300)
    @IsString()
    description: string

    @IsUrl()
    @IsString()
    @IsNotEmpty()
    url: string

    @IsNotEmpty()
    @IsInt({ each: true})
    @ArrayMinSize(1)
    tagIds: number[];
  }
    
  

