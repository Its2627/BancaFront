import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { UpdateUserDto } from "./user.dto";
import { me, updateMe } from "./user.controller";
import loginAttemptsRouter from "../loginAttempts/loginAttempts.router";
import operationLogRouter from "../operationLog/operationLog.router";

const router = Router();

router.get('/me', isAuthenticated, me);
router.patch('/me', isAuthenticated, validate(UpdateUserDto, 'body'), updateMe);

router.use('/me/login-attempts', loginAttemptsRouter);

router.use('/me/operations', operationLogRouter);

export default router;
