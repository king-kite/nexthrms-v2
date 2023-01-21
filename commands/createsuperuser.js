// const readline = require('readline').createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// });

// readline.question('Who are you?', name => {
// 	console.log(`Hey there ${name}!`);
// 	readline.close();
// })

const Joi = require("joi");
const JoiPasswordComplexity = require("joi-password-complexity");
const prompt = require("prompt-sync")({ sigint: true });

const passwordComplexityOptions = {
	min: 6,
	max: 30,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 6,
};

const { logger } = require("./index.js")

function handleJoiError(err) {
	if (err instanceof Joi.ValidationError) {
		const data = new Object();
		err.details.forEach((item) => {
			if (item.context) {
				const label = item.context.label
					? item.context.label.toLowerCase().replace(" ", "_")
					: "detail";
				Object.assign(data, {
					[item.context.key || label]: item.context.message || item.message,
				});
			}
		});
		return data;
	}
	return undefined;
}

async function getEmail() {
	const email = prompt("Enter e-mail: ");
	const [isValid, value] = await validateEmail(email.trim());
	if (!isValid) {
		logger.error(value + "\n");
		return getEmail()
	}
	return value;
}

async function validateEmail(value) {
	let isValid = false;
	let message = "E-mail is not valid. Please try again!";

	try {
		const validate = Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.label("email");

		const valid = await validate.validateAsync(value);
		return [true, valid];
	} catch (err) {
		const errorMessage = handleJoiError(err);
		if (errorMessage) message = errorMessage.email || message;
		else if (err.message) message = err.message;
		isValid = false;
	}

	return [isValid, message];
}

async function getPassword() {
	const password1 = prompt("Enter password: ", "", { echo: "*" });
	const password2 = prompt("Enter password again: ", "", { echo: "*" });

	if (password1 !== password2) {
		logger.error("\nPasswords do not match. Please try again!\n");
		return await getPassword();
	} else {
		const {valid, message} = await validatePassword(password1);
		if (!valid && message) {
			logger.error(message);
		}
		return message
	};
}

async function validatePassword(value) {
	const message = "Password does not meet all security requirements. Ignore and continue, Y/N ? ";
	const errorMessage = "An error occurred. Cannot save password. Please try again!"

	try {
		const validate = JoiPasswordComplexity(passwordComplexityOptions, 'password')
			.required()
			.label('password')

		const valid = await validate.validateAsync(value);
		return { value: true, message: valid };
	} catch (err) {
		const joiError = handleJoiError(err);
		if (joiError) {
			// ask question
			const ignore = prompt(message);
			if (ignore.trim().toLowerCase() === 'y') return { valid: true, message: value };
			else if (ignore.trim().toLowerCase() === 'n') {
				return { valid: false, message: "Create Super user action cancelled!" };
			} else {
				logger.warn("Invalid Entry. Enter 'Y' / 'N' ") // Add a new line
				return await validatePassword(value)
			}
		} else errorMessage = err.message || errorMessage
	}

	return { valid: false, message: errorMessage };
}

(async function main() {
	const fisrtName = prompt("Enter First Name: ");
	const lastName = prompt("Enter Last Name: ");
	const email = await getEmail();
	const password = await getPassword();

	console.log({ email, password, fisrtName, lastName })
})();
