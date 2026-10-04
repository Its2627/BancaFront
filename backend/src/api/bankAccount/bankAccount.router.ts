import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { me } from "./bankAccount.controller";

const router = Router();

router.get('/me', isAuthenticated, me);

export default router;
