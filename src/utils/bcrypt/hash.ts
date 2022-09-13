import bcrypt from 'bcrypt';

import { SALT_ROUNDS } from '../../config/settings';

async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	return await bcrypt.hash(password, salt);
}

export default hashPassword;
