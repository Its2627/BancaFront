import { IsDate, IsEmail, IsOptional, IsString, IsUrl, Matches, MaxDate, MinDate } from "class-validator";
import { Transform } from "class-transformer";
import { dateYearsAgo } from "../../lib/utils";

const MIN_AGE = 18;
const MAX_AGE = 120;

export const PASSWORD_RULE = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$');

export const PASSWORD_MESSAGE =
  'password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character.';

export class RegisterDto {
  @IsEmail()
  email: string;

  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @Transform(({ value }) => value === undefined || value === null ? value : new Date(value))
  @IsDate({ message: 'birthDate deve essere una data valida (es. 1990-05-23)' })
  @MaxDate(() => dateYearsAgo(MIN_AGE), { message: `per aprire un conto bisogna avere almeno ${MIN_AGE} anni` })
  @MinDate(() => dateYearsAgo(MAX_AGE), { message: 'birthDate non e\' una data di nascita plausibile' })
  birthDate: Date;

  @IsOptional()
  @IsUrl()
  picture?: string;

}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyEmailDto {
  @IsString()
  token: string;
}

export class ResendCodeDto {
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @Matches(PASSWORD_RULE, { message: PASSWORD_MESSAGE })
  password: string;
}
