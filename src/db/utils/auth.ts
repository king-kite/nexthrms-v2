import { Token } from '@prisma/client';
import prisma from '../client';
import { generateToken } from '../../utils/tokens';

export async function createToken({
	uid,
	type,
}: {
	uid: string;
	type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}): Promise<Token> {
	try {
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

		// TODO: Remove this from here later and send via email
		console.log('EMAIL VERIFICATION TOKEN :>> ', createdToken);

		return createdToken;
	} catch (error) {
		throw error;
	}
}
