import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResendCodeDto, ResetPasswordDto, VerifyEmailDto } from "./auth.dto";
import {changePassword, forgotPassword, login, logout, register, resendCode, resetPassword, verifyEmail} from "./auth.controller";

const router = Router();

router.post('/register', validate(RegisterDto, 'body'), register);
router.post('/login', validate(LoginDto, 'body'), login);
router.post('/logout', isAuthenticated, logout);

router.get('/verify-email', validate(VerifyEmailDto, 'query'), verifyEmail);
router.post('/resend-code', validate(ResendCodeDto, 'body'), resendCode);

router.patch('/password', isAuthenticated, validate(ChangePasswordDto, 'body'), changePassword);
router.post('/forgot-password', validate(ForgotPasswordDto, 'body'), forgotPassword);
router.post('/reset-password', validate(ResetPasswordDto, 'body'), resetPassword);

export default router
