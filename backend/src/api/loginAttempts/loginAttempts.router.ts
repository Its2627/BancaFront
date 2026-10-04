import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { QueryLoginAttemptsDto } from "./loginAttempts.dto";
import { list } from "./loginAttempts.controller";

const router = Router();

router.get('/', isAuthenticated, validate(QueryLoginAttemptsDto, 'query'), list);

export default router;
