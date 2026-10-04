import { Request } from "express";
import { Types } from "mongoose";
import { OperationLog, OperationOutcome, OperationType } from "./operationLog.entity";
import { OperationLogModel } from "./operationLog.model";
import { clientIp, clientUserAgent } from "../../lib/client-ip";

export class OperationLogService {

        async record(
        req: Request,
        operation: OperationType,
        outcome: OperationOutcome,
        detail?: string): Promise<void> {

        try {
            const userId = req.user?.id;

            if (!userId) {
                return;
            }

            await OperationLogModel.create({
                operation,
                user: new Types.ObjectId(userId),
                outcome,
                ipAddress: clientIp(req),
                userAgent: clientUserAgent(req),
                detail
            });
        } catch (err) {
            console.error('salvataggio log operazione fallito:', err);
        }
    }

    async findByUserId(
        userId: Types.ObjectId | string,
        limit = 20): Promise<OperationLog[]> {

        return await OperationLogModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export default new OperationLogService();
