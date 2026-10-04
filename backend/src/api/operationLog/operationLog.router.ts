import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { QueryOperationLogDto } from "./operationLog.dto";
import { list } from "./operationLog.controller";

const router = Router();

router.get('/', isAuthenticated, validate(QueryOperationLogDto, 'query'), list);

export default router;
