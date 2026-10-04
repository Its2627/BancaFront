import crypto from "crypto";

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const KEY_BYTES = 32;

const masterKey = (): Buffer => {
    const value = process.env.CARD_ENCRYPTION_KEY;

    if (!value) {
        throw new Error(
            'CARD_ENCRYPTION_KEY mancante nel .env. Generane una con:\n' +
            '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }

    const key = Buffer.from(value, 'hex');

    if (key.length !== KEY_BYTES) {
        throw new Error(`CARD_ENCRYPTION_KEY deve essere di ${KEY_BYTES} byte in esadecimale (${KEY_BYTES * 2} caratteri)`);
    }

    return key;
}

const derive = (label: string): Buffer =>
    crypto.createHmac('sha256', masterKey()).update(label).digest();

export const encrypt = (plainText: string): string => {
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, derive('encryption'), iv);

    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);

    return [iv, cipher.getAuthTag(), encrypted]
        .map(part => part.toString('base64'))
        .join('.');
}

export const decrypt = (payload: string): string => {
    const [iv, tag, encrypted] = payload.split('.').map(part => Buffer.from(part, 'base64'));

    const decipher = crypto.createDecipheriv(ALGORITHM, derive('encryption'), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export const blindIndex = (value: string): string =>
    crypto.createHmac('sha256', derive('blind-index')).update(value).digest('hex');

export const deriveDigits = (value: string, digits: number): string => {
    const digest = crypto.createHmac('sha256', derive('digits')).update(value).digest();
    const modulo = 10 ** digits;

    return String(digest.readUInt32BE(0) % modulo).padStart(digits, '0');
}
