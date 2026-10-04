import { validationHandler } from './validation-error';
import { genericErrorHandler } from "./generic";
import { notFoundHandler } from "./not-found.error";
import { alreadyCompletedHandler } from "./already-completed.error";
import { userExistsHandler } from "./user-exists.error";
import { invalidCredentialsHandler } from "./invalid-credentials.error";
import { insufficientFundsHandler } from "./insufficient-funds.error";
import { invalidRecipientHandler } from "./invalid-recipient.error";
import { invalidCardStatusHandler } from "./invalid-card-status.error";

export const errorHandlers = [
  validationHandler,
  notFoundHandler,
  alreadyCompletedHandler,
  userExistsHandler,
  invalidCredentialsHandler,
  insufficientFundsHandler,
  invalidRecipientHandler,
  invalidCardStatusHandler,
  genericErrorHandler
];
