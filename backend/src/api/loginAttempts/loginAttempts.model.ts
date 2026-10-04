import { LOGIN_OUTCOMES, LoginAttempt } from './loginAttempts.entity';
import { model, Schema } from "mongoose";
import { geoCity, geoCountry } from "../../lib/geo";

const RETENTION_DAYS = 90;

const loginAttemptsSchema = new Schema<LoginAttempt>({
    email: { type: String, required: true, lowercase: true, trim: true },
    outcome: { type: String, enum: LOGIN_OUTCOMES, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
}, { timestamps: true });

loginAttemptsSchema.index({ email: 1, createdAt: -1 });
loginAttemptsSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

loginAttemptsSchema.virtual("city").get(function () {
    return geoCity(this.ipAddress);
});

loginAttemptsSchema.virtual("country").get(function () {
    return geoCountry(this.ipAddress);
});

export const LoginAttemptModel = model<LoginAttempt>('LoginAttempt', loginAttemptsSchema);
