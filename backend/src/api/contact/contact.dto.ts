import { IsIBAN, IsString, Length } from "class-validator";

export class CreateContactDto {
    @IsString()
    @Length(1, 50)
    firstName: string;

    @IsString()
    @Length(1, 50)
    lastName: string;

    @IsIBAN(undefined, { message: 'iban non valido' })
    iban: string;
}
