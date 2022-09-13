import bcrypt from 'bcrypt';

async function comparePassword(
	password: string,
	hash: string
): Promise<boolean> {
	return await bcrypt.compare(password, hash);
}

export default comparePassword;
