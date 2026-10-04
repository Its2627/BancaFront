import { IsIn, IsNumber, IsPositive, IsString, Length, Matches, ValidateIf } from "class-validator";
import { CARD_TYPES, CardType } from "./card.entity";

const PIN_RULE = /^\d{4,6}$/;
const PIN_MESSAGE = 'il PIN deve essere di 4-6 cifre';

export class CreateCardDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @Matches(PIN_RULE, { message: PIN_MESSAGE })
  pin: string

  @IsIn(CARD_TYPES)
  type: CardType

  @ValidateIf(o => o.type === 'credit')
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  creditLimit?: number
}

export class RevealCardDto {

  @Matches(PIN_RULE, { message: PIN_MESSAGE })
  pin: string
}

export class RevealPinDto {

  @IsString()
  password: string
}

export class ChangeCardPinDto {
  @Matches(PIN_RULE, { message: `PIN attuale: ${PIN_MESSAGE}` })
  currentPin: string

  @Matches(PIN_RULE, { message: `nuovo PIN: ${PIN_MESSAGE}` })
  newPin: string
}
