import { Transform } from "class-transformer";
import { IsInt, Max, Min } from "class-validator";

const DEFAULT_LIMIT = 20;

export class QueryOperationLogDto {
    @Transform(({ value }) => value === undefined || value === '' ? DEFAULT_LIMIT : Number(value))
    @IsInt({ message: 'limit deve essere un numero intero' })
    @Min(1)
    @Max(100)
    limit: number = DEFAULT_LIMIT;
}
