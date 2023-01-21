const bcrypt = require('bcrypt');

function getSaltRounds() {
	if (process.env.SALT_ROUNDS) {
		return +process.env.SALT_ROUNDS;
	}
	return undefined;
}

const SALT_ROUNDS = getSaltRounds();

async function hashPassword(password) {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	return await bcrypt.hash(password, salt);
}

module.exports = {
	hash: hashPassword
}