import { Types } from "mongoose";

export const OPERATION_TYPES = ['transfer', 'recharge', 'change_password'] as const;

export const OPERATION_OUTCOMES = ['success', 'failed'] as const;

export type OperationType = typeof OPERATION_TYPES[number];
export type OperationOutcome = typeof OPERATION_OUTCOMES[number];

export type OperationLog = {
    operation: OperationType;
    user: Types.ObjectId;
    outcome: OperationOutcome;
    ipAddress: string;
    userAgent: string;
        detail?: string;
}
