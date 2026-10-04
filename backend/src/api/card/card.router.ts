import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { IdParams } from "../../lib/auth/id-params";
import { ChangeCardPinDto, CreateCardDto, RevealCardDto, RevealPinDto } from "./card.dto";
import { activate, block, changePin, create, list, remove, reveal, revealPin } from "./card.controller";

const router = Router();

router.get('/', isAuthenticated, list);
router.post('/create', isAuthenticated, validate(CreateCardDto, 'body'), create);
router.post('/:id/details', isAuthenticated, validate(IdParams, 'params'), validate(RevealCardDto, 'body'), reveal);

router.post('/:id/pin', isAuthenticated, validate(IdParams, 'params'), validate(RevealPinDto, 'body'), revealPin);

router.patch('/:id/activate', isAuthenticated, validate(IdParams, 'params'), activate);
router.patch('/:id/block', isAuthenticated, validate(IdParams, 'params'), block);
router.patch('/:id/pin', isAuthenticated, validate(IdParams, 'params'), validate(ChangeCardPinDto, 'body'), changePin);

router.delete('/:id', isAuthenticated, validate(IdParams, 'params'), remove);

export default router;
