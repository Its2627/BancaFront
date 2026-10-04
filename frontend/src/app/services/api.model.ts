export type TransactionDirection = 'in' | 'out';

export type TransactionType =
  | 'transfer'
  | 'deposit'
  | 'withdrawal'
  | 'card_payment'
  | 'account_opening';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export type CardStatus = 'inactive' | 'active' | 'blocked' | 'deleted';

export type CardType = 'credit' | 'debit' | 'prepaid';

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  age: number | null;
  picture?: string;
  email: string;
  emailVerified: boolean;
  registrationCity: string | null;
  registrationCountry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBankAccount {
  id: string;
  user: string;
  iban: string;
  balance: number;
  balanceEuro: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTransactionCategory {
  id: string;
  categoryName: string;
  type: 'income' | 'expense';
}

export interface ApiCounterparty {
  bankAccount?: string;
  iban?: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiTransaction {
  id: string;
  bankAccount: string;
  counterparty?: ApiCounterparty;
  date: string;
  amount: number;
  amountEuro: number;
  direction: TransactionDirection;
  type: TransactionType;
  balanceAfter: number;
  balanceAfterEuro: number;
  category: ApiTransactionCategory;
  paymentReference: string;
  status: TransactionStatus;
}

export interface ApiPaginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiCard {
  id: string;
  bankAccount: string;
  name: string;
  last4: string;
  maskedNumber: string;
  expiration: string;
  failedPinAttempts: number;
  status: CardStatus;
  type: CardType;
  creditLimitEuro: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCardDetails {
  cardNumber: string;
  cvv: string;
  expiration: string;
}

export type ApiCreatedCard = ApiCard & ApiCardDetails;

export interface ApiLoginAttempt {
  id: string;
  email: string;
  outcome: 'success' | 'failed';
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  message: string;
}
