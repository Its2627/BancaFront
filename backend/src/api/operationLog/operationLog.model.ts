import { model, Schema } from "mongoose";
import { geoCity, geoCountry } from "../../lib/geo";
import { OPERATION_OUTCOMES, OPERATION_TYPES, OperationLog } from "./operationLog.entity";

const RETENTION_DAYS = 365;

const operationLogSchema = new Schema<OperationLog>({
    operation: { type: String, required: true, enum: OPERATION_TYPES },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    outcome: { type: String, required: true, enum: OPERATION_OUTCOMES },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true, default: '' },
    detail: { type: String },
}, { timestamps: true });

operationLogSchema.index({ user: 1, createdAt: -1 });

operationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

operationLogSchema.virtual('city').get(function () {
    return geoCity(this.ipAddress);
});

operationLogSchema.virtual('country').get(function () {
    return geoCountry(this.ipAddress);
});

export const OperationLogModel = model<OperationLog>('OperationLog', operationLogSchema);
