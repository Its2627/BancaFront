import { IsUrl } from "class-validator";

export class UpdateUserDto {
    @IsUrl()
    picture: string;
}
