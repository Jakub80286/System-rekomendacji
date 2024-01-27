import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateTagDto {

    @IsString()
    @Length(1, 50)
    @IsNotEmpty()    
    tag_name: string
    
}