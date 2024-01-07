import { IsOptional, IsString } from "class-validator"

export class editTagDto{

    @IsString()
    @IsOptional()
    tag_name?: string
    
 
}