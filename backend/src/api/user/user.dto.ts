import { IsOptional, IsUrl } from "class-validator";

export class UpdateUserDto {
    @IsOptional()
    @IsUrl()
    picture?: string;
}
