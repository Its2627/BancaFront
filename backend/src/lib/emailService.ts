import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

const DEFAULT_FRONTEND_URL = 'https://banca-frontend.vercel.app';
const DEFAULT_BACKEND_URL = 'https://banca-backend.vercel.app/api';

const DOMINI_NON_VALIDI = ['banca-fe.vercel.app', 'banca-be.vercel.app'];

const normalizza = (valore: string | undefined, predefinito: string): string => {
    const pulito = (valore ?? '').trim().replace(/\/+$/, '');

    if (!pulito || DOMINI_NON_VALIDI.some(dominio => pulito.includes(dominio))) {
        return predefinito.replace(/\/+$/, '');
    }

    return pulito;
};

const frontendBaseUrl = (): string =>
    normalizza(process.env.FRONTEND_URL, process.env.NODE_ENV === 'production'
        ? DEFAULT_FRONTEND_URL
        : 'http://localhost:4200');

const backendBaseUrl = (): string =>
    normalizza(process.env.BACKEND_URL, process.env.NODE_ENV === 'production'
        ? DEFAULT_BACKEND_URL
        : 'http://localhost:3000/api');

export async function sendVerificationEmail(
    email: string,
    token: string
) {

    const baseUrl = backendBaseUrl();
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"MyBank" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Conferma il tuo indirizzo email",

        html: `
            <h1>Conferma la tua email</h1>

            <p>
                Grazie per esserti registrato.
            </p>

            <p>
                Clicca sul pulsante qui sotto per confermare
                il tuo indirizzo email.
            </p>

            <a href="${verificationUrl}">
                Conferma email
            </a>

            <p>
                Il link scadrà tra 1 ora.
            </p>
        `
    });
}
export async function sendPasswordResetEmail(
    email: string,
    token: string
) {

    const baseUrl = frontendBaseUrl();
    const resetUrl = `${baseUrl}/landing/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"MyBank" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Reimposta la tua password",

        html: `
            <h1>Reimposta la password</h1>

            <p>
                Abbiamo ricevuto una richiesta di reimpostazione della password
                per il tuo account.
            </p>

            <a href="${resetUrl}">
                Scegli una nuova password
            </a>

            <p>
                Il link scadrà tra 1 ora. Se non hai richiesto tu il cambio,
                ignora questa email: la tua password resta quella di prima.
            </p>
        `
    });
}
