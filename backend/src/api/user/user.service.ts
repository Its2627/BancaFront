import { HydratedDocument, Types } from "mongoose";
import { UserIdentityModel } from "../../lib/auth/local/user-identity.model";
import { UserIdentity } from "../../lib/auth/local/user-identity.entity";
import { User } from "./user.entity";
import { UserModel } from "./user.model";
import * as bcrypt from 'bcrypt';
import crypto from "crypto";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../lib/emailService";

const SALT_ROUNDS = 10;
const CODE_TTL_MS = 60 * 60 * 1000;

const newCode = () => crypto.randomBytes(32).toString("hex");

const expiresInAnHour = () => new Date(Date.now() + CODE_TTL_MS);

const isExpired = (date: Date | null | undefined): boolean =>
    !date || date.getTime() < Date.now();

export class UserService {

    async add(
        user: Omit<User, 'picture'> & { picture?: string },
        credentials: { email: string, password: string }): Promise<HydratedDocument<User>> {

        const newUser = await UserModel.create(user);

        const hashedPassword = await bcrypt.hash(credentials.password, SALT_ROUNDS);
        const verificationCode = newCode();

        await UserIdentityModel.create({
            provider: 'local',
            user: newUser._id,
            credentials: {
                email: credentials.email,
                hashedPassword
            },
            emailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpiresAt: expiresInAnHour()
        });

        try {
            await sendVerificationEmail(credentials.email, verificationCode);
        } catch (err) {
            console.error('invio email di verifica fallito:', err);
        }

        return newUser;
    }

    async existUser(email: string): Promise<boolean> {
        const existingIdentity = await UserIdentityModel.findOne({ 'credentials.email': email.toLowerCase() });
        return existingIdentity ? true : false;
    }

        async verifyEmail(code: string): Promise<Types.ObjectId | null> {
        const identity = await UserIdentityModel
            .findOne({ emailVerificationCode: code })
            .select('+emailVerificationCode');

        if (!identity || isExpired(identity.emailVerificationExpiresAt)) {
            return null;
        }

        identity.emailVerified = true;
        identity.emailVerificationCode = null;
        identity.emailVerificationExpiresAt = null;
        await identity.save();

        return identity.user;
    }

    async resendVerificationCode(email: string): Promise<void> {
        const identity = await UserIdentityModel.findOne({ 'credentials.email': email.toLowerCase() });

        if (!identity || identity.emailVerified) {
            return;
        }

        const verificationCode = newCode();
        identity.emailVerificationCode = verificationCode;
        identity.emailVerificationExpiresAt = expiresInAnHour();
        await identity.save();

        try {
            await sendVerificationEmail(identity.credentials.email, verificationCode);
        } catch (err) {
            console.error('invio email di verifica fallito:', err);
        }
    }

    async changePassword(
        userId: Types.ObjectId | string,
        currentPassword: string,
        newPassword: string): Promise<boolean> {

        const identity = await UserIdentityModel
            .findOne({ user: userId })
            .select('+credentials.hashedPassword');

        if (!identity) {
            return false;
        }

        const match = await bcrypt.compare(currentPassword, identity.credentials.hashedPassword);
        if (!match) {
            return false;
        }

        identity.credentials.hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        identity.passwordChangedAt = new Date();
        identity.tokenVersion += 1;
        await identity.save();

        return true;
    }

        async verifyPassword(
        userId: Types.ObjectId | string,
        password: string): Promise<boolean> {

        const identity = await UserIdentityModel
            .findOne({ user: userId })
            .select('+credentials.hashedPassword');

        if (!identity) {
            return false;
        }

        return await bcrypt.compare(password, identity.credentials.hashedPassword);
    }

    async forgotPassword(email: string): Promise<void> {
        const identity = await UserIdentityModel.findOne({ 'credentials.email': email.toLowerCase() });

        if (!identity) {
            return;
        }

        const resetCode = newCode();
        identity.passwordResetCode = resetCode;
        identity.passwordResetExpiresAt = expiresInAnHour();
        await identity.save();

        try {
            await sendPasswordResetEmail(identity.credentials.email, resetCode);
        } catch (err) {
            console.error('invio email di reset password fallito:', err);
        }
    }

    async resetPassword(code: string, newPassword: string): Promise<boolean> {
        const identity = await UserIdentityModel.findOne({ passwordResetCode: code });

        if (!identity || isExpired(identity.passwordResetExpiresAt)) {
            return false;
        }

        identity.credentials.hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        identity.passwordResetCode = null;
        identity.passwordResetExpiresAt = null;

        identity.passwordChangedAt = new Date();
        identity.tokenVersion += 1;
        await identity.save();

        return true;
    }

    async getIdentityByUserId(userId: Types.ObjectId | string): Promise<HydratedDocument<UserIdentity> | null> {
        return await UserIdentityModel.findOne({ user: userId });
    }

        async getProfile(userId: Types.ObjectId | string): Promise<Record<string, unknown> | null> {
        const identity = await UserIdentityModel
            .findOne({ user: userId })
            .populate<{ user: User }>('user');

        if (!identity || !identity.user) {
            return null;
        }

        return {
            ...(identity.user as any).toJSON(),
            email: identity.credentials.email,
            emailVerified: identity.emailVerified
        };
    }

    async updatePicture(
        userId: Types.ObjectId | string,
        picture: string): Promise<HydratedDocument<User> | null> {

        return await UserModel.findByIdAndUpdate(
            userId,
            { picture },
            { new: true, runValidators: true }
        );
    }

}

export default new UserService();
