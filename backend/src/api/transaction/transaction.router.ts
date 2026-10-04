import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { IdParams } from "../../lib/auth/id-params";
import { QueryStatsDto, QueryTransactionsDto, TransferDto } from './transaction.dto'
import { detail, list, stats, transfer } from "./transaction.controller";

const router = Router();

router.get('/', isAuthenticated, validate(QueryTransactionsDto, 'query'), list);
router.post('/transfer', isAuthenticated, validate(TransferDto, 'body'), transfer);

router.get('/stats', isAuthenticated, validate(QueryStatsDto, 'query'), stats);

router.get('/:id', isAuthenticated, validate(IdParams, 'params'), detail);

export default router
