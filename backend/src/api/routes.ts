import { Router } from "express";
import authRouter from "./auth/auth.router";
import userRouter from "./user/user.router";
import bankAccountRouter from "./bankAccount/bankAccount.router";
import cardRouter from './card/card.router';
import transactionRouter from './transaction/transaction.router'
import transactionCategoryRouter from './transactionCategory/transactionCat.router'
import contactRouter from './contact/contact.router'
import rechargeRouter from './recharge/recharge.router'

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/accounts", bankAccountRouter);
router.use("/cards", cardRouter)
router.use("/transactions", transactionRouter)
router.use("/transaction-categories", transactionCategoryRouter)
router.use("/contacts", contactRouter)
router.use("/recharge", rechargeRouter)

export default router;
