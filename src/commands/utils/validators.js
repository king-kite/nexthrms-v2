const { string, ValidationError } = require('yup');
const prompt = require('prompt-sync')({ sigint: true });

const logger = require('./logger.js');

const passwordOptions = string()
	.min(6, 'Password must be at least 6 characters')
	.max(30, 'Password must not exceed 30 characters')
	.matches(/[a-z]/, 'Password must contain at least one lowercase letter')
	.matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.matches(/[0-9]/, 'Password must contain at least one numeric character')
	.matches(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol');

function getYupError(path, value) {
	const keys = path.split('.');
	const result = {};

	let currentObj = result;
	keys.forEach((key, index) => {
		currentObj[key] = {};

		if (index === keys.length - 1) {
			currentObj[key] = value;
		}

		currentObj = currentObj[key];
	});
	return result;
}

function handleYupError(err) {
	if (err instanceof ValidationError) {
		let errors = {};
		if (err.inner.length > 0) {
			err.inner.forEach((error) => {
				const { path, message } = error;
				const parsedError = getYupError(path || 'message', message);

				if (path)
					errors = {
						...errors,
						...parsedError,
					};
			});
			return errors;
		} else {
			const parsedError = getYupError(
				err.path || 'message',
				err.errors[0] || err.message
			);
			errors = {
				...errors,
				...parsedError,
			};
			return errors;
		}
	}
	return undefined;
}

async function validatePassword(value) {
	const message =
		'Password does not meet all security requirements. Ignore and continue, Y/N ? ';
	const errorMessage =
		'An error occurred. Cannot save password. Please try again!';

	try {
		const validate = passwordOptions.required().label('password');

		const valid = await validate.validate(value);
		return { valid: true, message: valid };
	} catch (err) {
		const yupError = handleYupError(err);
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
		} else errorMessage = err.message || errorMessage;
	}

	return { valid: false, message: errorMessage };
}

async function validateEmail(value) {
	let isValid = false;
	let message = 'E-mail is not valid. Please try again!';

	try {
		const validate = string().email().required().label('email');

		const valid = await validate.validate(value);
		return [true, valid];
	} catch (err) {
		const errorMessage = handleYupError(err);
		if (errorMessage) message = errorMessage.email || message;
		else if (err.message) message = err.message;
		isValid = false;
	}

	return [isValid, message];
}

async function getEmail() {
	const email = prompt('Enter e-mail: ');
	const [isValid, value] = await validateEmail(email.trim());
	if (!isValid) {
		return getEmail();
	}
	return value;
}

async function getPassword() {
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

module.exports = {
	handleYupError,
	getEmail,
	getPassword,
};
