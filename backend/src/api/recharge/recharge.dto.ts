import { IsIn, IsNumber, IsPositive, Matches, Max } from "class-validator";
import { PHONE_OPERATORS, PhoneOperator } from "./recharge.entity";

const PHONE_RULE = /^(\+39)?3\d{8,9}$/;
const PHONE_MESSAGE = 'numero di cellulare non valido (es. 3331234567)';

const MAX_AMOUNT = 500;

export class DoRechargeDto {
    @Matches(PHONE_RULE, { message: PHONE_MESSAGE })
    phoneNumber: string;

    @IsIn(PHONE_OPERATORS, { message: `operator deve essere uno fra: ${PHONE_OPERATORS.join(', ')}` })
    operator: PhoneOperator;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Max(MAX_AMOUNT, { message: `l'importo massimo di una ricarica e' ${MAX_AMOUNT} euro` })
    amount: number;
}
