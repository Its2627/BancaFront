import { RevokedTokenModel } from "./revoked-token.model";

export class TokenService {

        async revoke(jti: string, expiresAt: Date): Promise<void> {
        await RevokedTokenModel.updateOne(
            { jti },
            { $setOnInsert: { jti, expiresAt } },
            { upsert: true }
        );
    }

    async isRevoked(jti?: string): Promise<boolean> {
        if (!jti) {

            return false;
        }
        return await RevokedTokenModel.exists({ jti }) !== null;
    }

}

export default new TokenService();
