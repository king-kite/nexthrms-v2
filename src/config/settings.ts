function getDefaultPaginationSize(): number {
	if (process.env.DEFAULT_PAGINATION_SIZE) {
		return +process.env.DEFAULT_PAGINATION_SIZE;
	}
	return 100;
}

function getEmailVerificationRequired(): boolean {
	if (process.env.EMAIL_VERIFICATION_REQUIRED) {
		return !!+process.env.EMAIL_VERIFICATION_REQUIRED;
	}
	return true;
}

function getSaltRounds(): number | undefined {
	if (process.env.SALT_ROUNDS) {
		return +process.env.SALT_ROUNDS;
	}
	return undefined;
}

function getSecretKey(): string | undefined {
	if (process.env.SECRET_KEY) {
		return process.env.SECRET_KEY;
	}
	return undefined;
}

// Also use for employee table and client table
export const ANONYMOUS_USER_ID = '12345678-1234-4b89-8c04-789012345678';
export const DEFAULT_PAGINATION_SIZE = getDefaultPaginationSize();
export const EMAIL_VERIFICATION_REQUIRED = getEmailVerificationRequired();
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
export const SALT_ROUNDS = getSaltRounds();
export const SECRET_KEY = getSecretKey();
