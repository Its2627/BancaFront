import * as bcrypt from 'bcrypt';
import { HydratedDocument, Types } from 'mongoose';
import { Card, CardDetails, CardStatus } from "./card.entity";
import { CardModel } from "./card.model";
import { CreateCardDto } from "./card.dto";
import { blindIndex, decrypt, encrypt } from '../../lib/crypto';
import { deriveCvv, euroToCents, generateCardNumber, generateExpiration } from "../../lib/utils";
import { InvalidCredentialsError } from '../../errors/invalid-credentials.error';
import { InvalidCardStatusError } from '../../errors/invalid-card-status.error';

const MAX_ATTEMPTS = 5;
const DUPLICATE_KEY = 11000;
const SALT_ROUNDS = 10;
const MAX_PIN_ATTEMPTS = 3;

const ALLOWED_TRANSITIONS: Record<CardStatus, CardStatus[]> = {
    inactive: ['active', 'blocked', 'deleted'],
    active: ['blocked', 'deleted'],
    blocked: ['active', 'deleted'],
    deleted: []
};

export type CreatedCard = {
    card: HydratedDocument<Card>,
    details: CardDetails
}

export class CardService {

    async create(bankAccountId: Types.ObjectId | string, body: CreateCardDto): Promise<CreatedCard> {

        const hashedPin = await bcrypt.hash(body.pin, SALT_ROUNDS);

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {

            const cardNumber = generateCardNumber();
            const expiration = generateExpiration();

            const newCard: Card = {
                bankAccount: new Types.ObjectId(bankAccountId),
                name: body.name,
                encryptedCardNumber: encrypt(cardNumber),
                cardNumberHash: blindIndex(cardNumber),
                last4: cardNumber.slice(-4),
                expiration,
                hashedPin,
                encryptedPin: encrypt(body.pin),
                failedPinAttempts: 0,
                status: 'active',
                type: body.type,
                creditLimit: body.type === 'credit' ? euroToCents(body.creditLimit!) : undefined
            }

            try {
                const card = await CardModel.create(newCard);
                return {
                    card,
                    details: { cardNumber, cvv: deriveCvv(cardNumber, expiration), expiration }
                };
            } catch (err: any) {
                if (err?.code !== DUPLICATE_KEY) {
                    throw err;
                }
            }
        }

        throw new Error('impossibile generare un numero di carta univoco');
    }

        async findByBankAccountId(bankAccountId: Types.ObjectId | string): Promise<Card[]> {
        return await CardModel
            .find({ bankAccount: bankAccountId, status: { $ne: 'deleted' } })
            .sort({ createdAt: -1 });
    }

        async findByCardNumber(cardNumber: string): Promise<HydratedDocument<Card> | null> {
        return await CardModel.findOne({ cardNumberHash: blindIndex(cardNumber) });
    }

        async revealDetails(
        cardId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string,
        pin: string): Promise<CardDetails | null> {

        const card = await this.findOwned(cardId, bankAccountId, '+encryptedCardNumber +hashedPin');

        if (!card) {
            return null;
        }

        if (!await this.checkPin(card, pin)) {
            throw new InvalidCredentialsError('PIN non corretto');
        }

        const cardNumber = decrypt(card.encryptedCardNumber);

        return { cardNumber, cvv: deriveCvv(cardNumber, card.expiration), expiration: card.expiration };
    }

        async changeStatus(
        cardId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string,
        status: CardStatus): Promise<HydratedDocument<Card> | null> {

        const card = await this.findOwned(cardId, bankAccountId);

        if (!card) {
            return null;
        }

        if (card.status === status) {
            return card;
        }

        if (!ALLOWED_TRANSITIONS[card.status].includes(status)) {
            throw new InvalidCardStatusError(
                `una carta ${card.status} non puo' passare a ${status}`
            );
        }

        card.status = status;

        if (status === 'active') {
            card.failedPinAttempts = 0;
        }

        await card.save();

        return card;
    }

    async changePin(
        cardId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string,
        currentPin: string,
        newPin: string): Promise<HydratedDocument<Card> | null> {

        const card = await this.findOwned(cardId, bankAccountId, '+hashedPin');

        if (!card) {
            return null;
        }

        if (card.status !== 'active') {
            throw new InvalidCardStatusError(`la carta e' ${card.status}: il PIN si cambia solo se e' attiva`);
        }

        if (!await this.checkPin(card, currentPin)) {
            throw new InvalidCredentialsError('PIN attuale non corretto');
        }

        if (await bcrypt.compare(newPin, card.hashedPin)) {
            throw new InvalidCredentialsError('il nuovo PIN deve essere diverso da quello attuale');
        }

        card.hashedPin = await bcrypt.hash(newPin, SALT_ROUNDS);

        card.encryptedPin = encrypt(newPin);
        card.failedPinAttempts = 0;
        await card.save();

        return card;
    }

        async revealPin(
        cardId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string): Promise<string | null> {

        const card = await this.findOwned(cardId, bankAccountId, '+encryptedPin');

        if (!card) {
            return null;
        }

        return decrypt(card.encryptedPin);
    }

    async verifyPin(cardId: Types.ObjectId | string, pin: string): Promise<boolean> {
        const card = await CardModel.findById(cardId).select('+hashedPin');
        return card ? await this.checkPin(card, pin) : false;
    }

        private findOwned(
        cardId: Types.ObjectId | string,
        bankAccountId: Types.ObjectId | string,
        select?: string) {

        const query = CardModel.findOne({ _id: cardId, bankAccount: bankAccountId });

        return select ? query.select(select) : query;
    }

        private async checkPin(card: HydratedDocument<Card>, pin: string): Promise<boolean> {
        if (card.status !== 'active') {
            return false;
        }

        if (await bcrypt.compare(pin, card.hashedPin)) {
            if (card.failedPinAttempts > 0) {
                card.failedPinAttempts = 0;
                await CardModel.updateOne({ _id: card._id }, { failedPinAttempts: 0 });
            }
            return true;
        }

        card.failedPinAttempts += 1;

        if (card.failedPinAttempts >= MAX_PIN_ATTEMPTS) {
            card.status = 'blocked';
        }

        await CardModel.updateOne({ _id: card._id }, {
            failedPinAttempts: card.failedPinAttempts,
            status: card.status
        });

        return false;
    }

}

export default new CardService();
