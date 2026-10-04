import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { IdParams } from "../../lib/auth/id-params";
import { CreateContactDto } from "./contact.dto";
import { create, list, remove } from "./contact.controller";

const router = Router();

router.get('/', isAuthenticated, list);
router.post('/', isAuthenticated, validate(CreateContactDto, 'body'), create);
router.delete('/:id', isAuthenticated, validate(IdParams, 'params'), remove);

export default router;
