export const LOGIN_OUTCOMES = ['success', 'failed'] as const;

export type LoginOutcome = typeof LOGIN_OUTCOMES[number];

export type LoginAttempt = {
    email: string;
    outcome: LoginOutcome;
    ipAddress: string;
    userAgent: string;
}
