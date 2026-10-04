import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { DoRechargeDto } from "./recharge.dto";
import { dashboard, doRecharge } from "./recharge.controller";

const router = Router();

router.get('/dashboard-data', isAuthenticated, dashboard);
router.post('/do-recharge', isAuthenticated, validate(DoRechargeDto, 'body'), doRecharge);

export default router;
