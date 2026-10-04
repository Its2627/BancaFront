import { Types } from "mongoose";

export type Contact = {
    bankAccount: Types.ObjectId;
    firstName: string;
    lastName: string;
    iban: string;
}
