import { Transform } from "class-transformer";
import {
  IsDate, IsIBAN, IsIn, IsInt, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Length, Max, Min
} from "class-validator";
import { TRANSACTION_TYPES, TransactionType } from "./transaction.entity";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const empty = (value: unknown) => value === undefined || value === null || value === '';

const toDate = ({ value }: { value: any }) => empty(value) ? undefined : new Date(value);
const toNumber = ({ value }: { value: any }) => empty(value) ? undefined : Number(value);
const toIntOr = (fallback: number) =>
  ({ value }: { value: any }) => empty(value) ? fallback : Number(value);

export class TransferDto {
  @IsIBAN(undefined, { message: 'iban non valido' })
  iban: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number

  @IsString()
  @Length(1, 140)
  paymentReference: string

}

export class QueryStatsDto {
  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'from deve essere una data valida (es. 2026-01-31)' })
  from?: Date;

  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'to deve essere una data valida (es. 2026-01-31)' })
  to?: Date;
}

export class QueryTransactionsDto {
  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'from deve essere una data valida (es. 2026-01-31)' })
  from?: Date;

  @IsOptional()
  @Transform(toDate)
  @IsDate({ message: 'to deve essere una data valida (es. 2026-01-31)' })
  to?: Date;

  @IsOptional()
  @IsMongoId({ message: 'categoryId deve essere un id valido' })
  categoryId?: string;

  @IsOptional()
  @IsIn(TRANSACTION_TYPES, { message: `type deve essere uno fra: ${TRANSACTION_TYPES.join(', ')}` })
  type?: TransactionType;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'minAmount deve essere un numero' })
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'maxAmount deve essere un numero' })
  @Min(0)
  maxAmount?: number;

  @Transform(toIntOr(DEFAULT_PAGE))
  @IsInt({ message: 'page deve essere un numero intero' })
  @Min(1)
  page: number = DEFAULT_PAGE;

  @Transform(toIntOr(DEFAULT_LIMIT))
  @IsInt({ message: 'limit deve essere un numero intero' })
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;
}
