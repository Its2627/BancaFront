import '../lib/env';
import mongoose from 'mongoose';
import { connectDb, syncIndexes } from '../lib/db';
import { seedTransactionCategories, SYSTEM_CATEGORIES } from '../api/transactionCategory/transactionCat.seed';
import { TransactionCategoryModel } from '../api/transactionCategory/transactionCat.model';
import { UserIdentityModel } from '../lib/auth/local/user-identity.model';
import { UserModel } from '../api/user/user.model';
import { BankAccountModel } from '../api/bankAccount/bankAccount.model';
import { TransactionModel } from '../api/transaction/transaction.model';
import { CardModel } from '../api/card/card.model';
import { ContactModel } from '../api/contact/contact.model';
import { RechargeModel } from '../api/recharge/recharge.model';
import { PhoneOperator } from '../api/recharge/recharge.entity';
import bankAccountSrv from '../api/bankAccount/bankAccount.service';
import cardSrv from '../api/card/card.service';
import { euroToCents } from '../lib/utils';
import { CardType } from '../api/card/card.entity';
import * as bcrypt from 'bcrypt';
import { IBAN, CountryCode } from 'ibankit';

const PASSWORD = 'Password1!';
const PIN = '1234';

const OPENING_DAYS_AGO = 200;

const SALT_ROUNDS = 10;

type DemoUser = {
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    cards: { name: string; type: CardType; creditLimit?: number }[];
    withExtras: boolean;
};

const MAIN_USER: DemoUser = {
    email: 'giatti.francesco@gmail.com',
    firstName: 'Francesco',
    lastName: 'Giatti',
    birthDate: '1998-03-14',
    cards: [
        { name: 'Carta principale', type: 'debit' },
        { name: 'Carta di credito', type: 'credit', creditLimit: 3000 },
        { name: 'Prepagata online', type: 'prepaid' },
    ],
    withExtras: true,
};

const COUNTERPART_USER: DemoUser = {
    email: 'controparte.test@example.com',
    firstName: 'Giulia',
    lastName: 'Bianchi',
    birthDate: '1993-11-02',
    cards: [{ name: 'Carta prepagata', type: 'prepaid' }],
    withExtras: false,
};

const LEGACY_EMAILS = ['mario.rossi@example.com', 'giulia.bianchi@example.com'];

const DEMO_MOVEMENTS: { daysAgo: number; amount: number; category: string; reference: string }[] = [
    { daysAgo: 198, amount: 5000.0, category: 'Versamento contante', reference: 'Versamento iniziale di apertura' },

    { daysAgo: 165, amount: 2400.0, category: 'Stipendio', reference: 'Bonifico disposto da Azienda Alfa S.r.l. - stipendio' },
    { daysAgo: 162, amount: -210.0, category: 'Affitto', reference: 'Bonifico disposto a favore di Immobiliare Aurora' },
    { daysAgo: 150, amount: -84.0, category: 'Bollette', reference: 'Addebito diretto a favore di Enel Energia' },

    { daysAgo: 135, amount: 2400.0, category: 'Stipendio', reference: 'Bonifico disposto da Azienda Alfa S.r.l. - stipendio' },
    { daysAgo: 132, amount: -210.0, category: 'Affitto', reference: 'Bonifico disposto a favore di Immobiliare Aurora' },
    { daysAgo: 120, amount: -310.0, category: 'Viaggi', reference: 'Bonifico disposto a favore di Agenzia Viaggi Sole' },

    { daysAgo: 105, amount: 2400.0, category: 'Stipendio', reference: 'Bonifico disposto da Azienda Alfa S.r.l. - stipendio' },
    { daysAgo: 102, amount: -210.0, category: 'Affitto', reference: 'Bonifico disposto a favore di Immobiliare Aurora' },
    { daysAgo: 90, amount: -148.0, category: 'Salute', reference: 'Bonifico disposto a favore di Studio Dentistico Bianchi' },

    { daysAgo: 75, amount: 2400.0, category: 'Stipendio', reference: 'Bonifico disposto da Azienda Alfa S.r.l. - stipendio' },
    { daysAgo: 72, amount: -210.0, category: 'Affitto', reference: 'Bonifico disposto a favore di Immobiliare Aurora' },
    { daysAgo: 60, amount: -95.0, category: 'Carburante', reference: 'Addebito diretto a favore di Stazione di servizio Esso' },

    { daysAgo: 45, amount: 2400.0, category: 'Stipendio', reference: 'Bonifico disposto da Azienda Alfa S.r.l. - stipendio' },
    { daysAgo: 42, amount: -210.0, category: 'Affitto', reference: 'Bonifico disposto a favore di Immobiliare Aurora' },
    { daysAgo: 36, amount: -90.0, category: 'Viaggi', reference: 'Bonifico disposto a favore di Trenitalia S.p.A.' },
    { daysAgo: 28, amount: 150.0, category: 'Rimborso', reference: 'Bonifico disposto da Luca Verdi - rimborso spese' },
    { daysAgo: 24, amount: -48.0, category: 'Spesa alimentare', reference: 'Addebito diretto a favore di Supermercato Centrale' },
    { daysAgo: 21, amount: -35.5, category: 'Svago', reference: 'Bonifico disposto a favore di Libreria Mondo' },
    { daysAgo: 18, amount: -120.0, category: 'Salute', reference: 'Bonifico disposto a favore di Studio Medico Rossi' },

    { daysAgo: 15, amount: 2400.0, category: 'Stipendio', reference: 'Bonifico disposto da Azienda Alfa S.r.l. - stipendio' },
    { daysAgo: 12, amount: -210.0, category: 'Affitto', reference: 'Bonifico disposto a favore di Immobiliare Aurora' },
    { daysAgo: 9, amount: -60.0, category: 'Carburante', reference: 'Addebito diretto a favore di Stazione di servizio Esso' },
    { daysAgo: 7, amount: -9.99, category: 'Abbonamenti', reference: 'Addebito diretto a favore di Music Streaming Ltd' },
    { daysAgo: 5, amount: -25.0, category: 'Ristoranti', reference: 'Addebito diretto a favore di Trattoria del Porto' },
    { daysAgo: 3, amount: -78.0, category: 'Bollette', reference: 'Addebito diretto a favore di Enel Energia' },
    { daysAgo: 2, amount: -12.5, category: 'Trasporti', reference: 'Addebito diretto a favore di Conerobus' },
    { daysAgo: 1, amount: -42.9, category: 'Spesa alimentare', reference: 'Addebito diretto a favore di Supermercato Centrale' },
];

const DEMO_CONTACT_NAMES = [
    { firstName: 'Luca', lastName: 'Verdi' },
    { firstName: 'Anna', lastName: 'Neri' },
];

const DEMO_RECHARGES: { daysAgo: number; phoneNumber: string; operator: PhoneOperator; amount: number }[] = [

    { daysAgo: 0, phoneNumber: '3331234567', operator: 'TIM', amount: 20 },
    { daysAgo: 2, phoneNumber: '3489876543', operator: 'Iliad', amount: 10 },
    { daysAgo: 4, phoneNumber: '3331234567', operator: 'TIM', amount: 10 },
    { daysAgo: 20, phoneNumber: '3331234567', operator: 'TIM', amount: 20 },
    { daysAgo: 38, phoneNumber: '3489876543', operator: 'Iliad', amount: 10 },
    { daysAgo: 65, phoneNumber: '3489876543', operator: 'Iliad', amount: 10 },
    { daysAgo: 95, phoneNumber: '3201112233', operator: 'Vodafone', amount: 5 },
];

const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const purge = async (email: string): Promise<void> => {
    const identity = await UserIdentityModel.findOne({ 'credentials.email': email.toLowerCase() });

    if (!identity) {
        return;
    }

    const account = await BankAccountModel.findOne({ user: identity.user });

    if (account) {
        await Promise.all([
            CardModel.deleteMany({ bankAccount: account._id }),
            TransactionModel.deleteMany({ bankAccount: account._id }),
            ContactModel.deleteMany({ bankAccount: account._id }),
            RechargeModel.deleteMany({ bankAccount: account._id }),
        ]);
        await account.deleteOne();
    }

    await UserModel.deleteOne({ _id: identity.user });
    await identity.deleteOne();
};

type CreatedDemo = {
    firstName: string;
    lastName: string;
    iban: string;
    bankAccountId: mongoose.Types.ObjectId;
};

const createDemoUser = async (demo: DemoUser): Promise<CreatedDemo> => {
    await purge(demo.email);

    const user = await UserModel.create({
        firstName: demo.firstName,
        lastName: demo.lastName,
        birthDate: new Date(demo.birthDate),
    });

    await UserIdentityModel.create({
        provider: 'local',
        user: user._id,
        credentials: {
            email: demo.email,
            hashedPassword: await bcrypt.hash(PASSWORD, SALT_ROUNDS),
        },
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpiresAt: null,
        tokenVersion: 0,
    });

    const newBankAccount = await bankAccountSrv.create(user._id);

    const firstTransaction = await bankAccountSrv.createOpeningTransaction(user._id);

    if (firstTransaction) {
        await TransactionModel.updateOne(
            { _id: firstTransaction._id },
            { date: daysAgo(OPENING_DAYS_AGO) }
        );
    }

    const finalBalance = await seedTimeline(newBankAccount._id, demo.withExtras);

    await BankAccountModel.updateOne({ _id: newBankAccount._id }, { balance: finalBalance });

    for (const card of demo.cards) {
        await cardSrv.create(newBankAccount._id, { ...card, pin: PIN });
    }

    console.log(`  ${demo.email}`);
    console.log(`    password : ${PASSWORD}`);
    console.log(`    IBAN     : ${newBankAccount.iban}`);
    console.log(`    saldo    : ${(finalBalance / 100).toFixed(2)} EUR`);
    console.log(`    carte    : ${demo.cards.length} (PIN ${PIN})`);

    return {
        firstName: demo.firstName,
        lastName: demo.lastName,
        iban: newBankAccount.iban,
        bankAccountId: newBankAccount._id,
    };
};

const seedTimeline = async (
    bankAccountId: mongoose.Types.ObjectId,
    withRecharges: boolean
): Promise<number> => {

    type Event = {
        daysAgo: number;
        cents: number;
        category: string;
        reference: string;
        recharge?: { phoneNumber: string; operator: PhoneOperator };
    };

    const events: Event[] = DEMO_MOVEMENTS.map(m => ({
        daysAgo: m.daysAgo,
        cents: euroToCents(m.amount),
        category: m.category,
        reference: m.reference,
    }));

    if (withRecharges) {
        for (const r of DEMO_RECHARGES) {
            events.push({
                daysAgo: r.daysAgo,
                cents: -euroToCents(r.amount),
                category: SYSTEM_CATEGORIES.phoneRecharge,
                reference: `Ricarica ${r.operator} ${r.phoneNumber}`,
                recharge: { phoneNumber: r.phoneNumber, operator: r.operator },
            });
        }
    }

    events.sort((a, b) => b.daysAgo - a.daysAgo);

    let balance = 0;

    for (const event of events) {
        const category = await TransactionCategoryModel.findOne({ categoryName: event.category });

        if (!category) {
            console.warn(`  categoria non trovata, movimento saltato: ${event.category}`);
            continue;
        }

        balance += event.cents;

        if (balance < 0) {

            throw new Error(
                `i movimenti di esempio portano il saldo sotto zero a ${event.daysAgo} giorni fa`
            );
        }

        const date = daysAgo(event.daysAgo);

        const transaction = await TransactionModel.create({
            bankAccount: bankAccountId,
            date,

            amount: Math.abs(event.cents),
            direction: event.cents >= 0 ? 'in' : 'out',
            type: event.recharge ? 'withdrawal' : (event.cents >= 0 ? 'deposit' : 'card_payment'),
            balanceAfter: balance,
            category: category._id,
            paymentReference: event.reference,
            status: 'completed',
        });

        if (event.recharge) {
            await RechargeModel.create({
                bankAccount: bankAccountId,
                phoneNumber: event.recharge.phoneNumber,
                operator: event.recharge.operator,
                amount: Math.abs(event.cents),
                transaction: transaction._id,
                date,
            });
        }
    }

    return balance;
};

const seedContacts = async (
    bankAccountId: mongoose.Types.ObjectId,
    counterpart?: { firstName: string; lastName: string; iban: string }
): Promise<void> => {
    const contacts = [

        ...(counterpart ? [counterpart] : []),
        ...DEMO_CONTACT_NAMES.map(name => ({
            ...name,
            iban: IBAN.random(CountryCode.IT).toString(),
        })),
    ];

    await ContactModel.insertMany(
        contacts.map(c => ({ bankAccount: bankAccountId, ...c }))
    );
};

const main = async () => {
    const withCounterpart = process.argv.includes('--con-controparte');

    await connectDb();
    await syncIndexes();
    await seedTransactionCategories();

    for (const email of LEGACY_EMAILS) {
        await purge(email);
    }

    console.log('\nutenti creati:\n');

    const mainAccount = await createDemoUser(MAIN_USER);
    console.log('');

    let counterpart: CreatedDemo | undefined;

    if (withCounterpart) {
        counterpart = await createDemoUser(COUNTERPART_USER);
        console.log('');
    }

    await seedContacts(mainAccount.bankAccountId, counterpart && {
        firstName: counterpart.firstName,
        lastName: counterpart.lastName,
        iban: counterpart.iban,
    });

    if (!withCounterpart) {
        console.log('per provare i bonifici serve un secondo conto in questo database:');
        console.log('  npm run seed:demo -- --con-controparte\n');
    } else {
        console.log('i due conti si possono usare per provare i bonifici fra loro.\n');
    }

    await mongoose.disconnect();
};

main().catch(async err => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
