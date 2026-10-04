import { IBAN, CountryCode } from "ibankit";
import crypto from "crypto";
import { deriveDigits } from "./crypto";

const CARD_BIN = '400000';
const CARD_NUMBER_LENGTH = 16;
const CARD_VALIDITY_YEARS = 3;
const CVV_LENGTH = 3;

export const generateIban = async (): Promise<string> => {
    const iban = IBAN.random(CountryCode.IT);
    console.log(iban.toString());

    return iban.toString();
}

const luhnCheckDigit = (partialNumber: string): string => {
    const digits = partialNumber.split('').reverse().map(Number);

    const sum = digits.reduce((total, digit, index) => {
        if (index % 2 === 0) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        return total + digit;
    }, 0);

    return String((10 - (sum % 10)) % 10);
}

export const generateCardNumber = (): string => {
    let partialNumber = CARD_BIN;
    while (partialNumber.length < CARD_NUMBER_LENGTH - 1) {
        partialNumber += crypto.randomInt(10);
    }

    return partialNumber + luhnCheckDigit(partialNumber);
}

export const deriveCvv = (cardNumber: string, expiration: Date): string => {
    const period = `${expiration.getFullYear()}-${expiration.getMonth() + 1}`;

    return deriveDigits(`cvv|${cardNumber}|${period}`, CVV_LENGTH);
}

export const generateExpiration = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear() + CARD_VALIDITY_YEARS, now.getMonth() + 1, 0, 23, 59, 59);
}

export const euroToCents = (euro: number): number => Math.round(euro * 100);

export const centsToEuro = (cents: number): number => cents / 100;

export const dateYearsAgo = (years: number): Date => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    return date;
}

export const yearsSince = (date: Date): number => {
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
        years--;
    }

    return years;
}
