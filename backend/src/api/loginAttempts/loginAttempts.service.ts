import { LoginAttempt } from './loginAttempts.entity';
import { LoginAttemptModel } from './loginAttempts.model';

export class LoginAttemptService {

    async record(attempt: LoginAttempt): Promise<void> {
        try {
            await LoginAttemptModel.create(attempt);
        } catch (err) {
            console.error('salvataggio tentativo di login fallito:', err);
        }
    }

    async findByEmail(email: string, limit = 20): Promise<LoginAttempt[]> {
        return await LoginAttemptModel.find({ email }).sort({ createdAt: -1 }).limit(limit);
    }

}

export default new LoginAttemptService();
