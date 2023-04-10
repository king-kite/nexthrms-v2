import { Token } from '@prisma/client';

import prisma from '../client';
import { generateToken } from '../../utils/tokens';

export async function createToken({
	type,
	uid,
}: {
	type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
	uid: string;
}): Promise<Token> {
	try {
		const oldToken = await prisma.token.findFirst({
			where: { uid, type },
		});

		if (oldToken && oldToken.expires >= new Date()) return oldToken;

		// Delete old tokens with same uid and type
		await prisma.token.deleteMany({ where: { uid, type } });

		// Generate a new token
		const token = await generateToken();

		// Create a new token in the database
		const createdToken = await prisma.token.create({
			data: {
				uid,
				type,
				token,
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
			},
		});
		return createdToken;
	} catch (error) {
		throw error;
	}
}
