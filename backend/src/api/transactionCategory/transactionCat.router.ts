import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { list } from "./transactionCat.controller";

const router = Router();

router.get('/', isAuthenticated, list);

export default router;
