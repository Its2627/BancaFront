import { Types } from "mongoose";

export type BankAccount = {
    user: Types.ObjectId;
    iban: string;
    balance: number;
}
