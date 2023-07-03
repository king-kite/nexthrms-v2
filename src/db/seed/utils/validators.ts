import promptSync from 'prompt-sync';
import { string } from 'yup';

import logger from './logger';
import { handleYupErrors } from '../../../validators/errors';
import { passwordOptions } from '../../../validators/users';

const prompt = promptSync({ sigint: true });

async function validatePassword(value: string): Promise<{
	valid: boolean;
	message: string;
}> {
	const message =
		'Password does not meet all security requirements. Ignore and continue, Y/N ? ';
	let errorMessage =
		'An error occurred. Cannot save password. Please try again!';

	try {
		const validate = passwordOptions.required().label('password');

		const valid = await validate.validate(value);
		return { valid: true, message: valid };
	} catch (err) {
		const yupError = handleYupErrors(err);
		if (yupError) {
			// ask question
			const ignore = prompt(message);
			if (ignore.trim().toLowerCase() === 'y')
				return { valid: true, message: value };
			else if (ignore.trim().toLowerCase() === 'n') {
				return { valid: false, message: 'Create Super user action cancelled!' };
			} else {
				logger.warn("Invalid Entry. Enter 'Y' / 'N' "); // Add a new line
				return await validatePassword(value);
			}
		} else errorMessage = (err as any).message || errorMessage;
	}

	return { valid: false, message: errorMessage };
}

async function validateEmail(value: string): Promise<(boolean | string)[]> {
	let isValid = false;
	let message = 'E-mail is not valid. Please try again!';

	try {
		const validate = string().email().required().label('email');

		const valid = await validate.validate(value);
		return [true, valid];
	} catch (err) {
		const errorMessage = handleYupErrors(err);
		if (errorMessage) message = errorMessage.email || message;
		else if ((err as any).message) message = (err as any).message;
		isValid = false;
	}

	return [isValid, message];
}

export async function getEmail(): Promise<string> {
	const email = prompt('Enter e-mail: ');
	const [isValid, value] = await validateEmail(email.trim());
	if (!isValid) {
		return getEmail();
	}
	return value.toString();
}

export async function getPassword(): Promise<string> {
	const password1 = prompt('Enter password: ', '', { echo: '*' });
	const password2 = prompt('Enter password again: ', '', { echo: '*' });

	if (password1 !== password2) {
		logger.error('\nPasswords do not match. Please try again!\n');
		return await getPassword();
	} else {
		const { valid, message } = await validatePassword(password1);
		if (!valid && message) {
			logger.error(message + ' A fail ' + valid);
		}
		return message;
	}
}
