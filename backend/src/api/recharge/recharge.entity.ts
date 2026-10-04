import { Types } from "mongoose";

export const PHONE_OPERATORS = ['TIM', 'Vodafone', 'WindTre', 'Iliad', 'Fastweb', 'PosteMobile'] as const;

export type PhoneOperator = typeof PHONE_OPERATORS[number];

export type Recharge = {
    bankAccount: Types.ObjectId;
    phoneNumber: string;
    operator: PhoneOperator;

    amount: number;

    transaction: Types.ObjectId;
    date: Date;
}
