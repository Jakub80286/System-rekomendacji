import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTagDto {

    @IsString()
    @IsNotEmpty()    
    tag_name: string
    
}