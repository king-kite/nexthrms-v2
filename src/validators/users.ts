import Joi from 'joi';
import JoiPasswordComplexity from 'joi-password-complexity';

const passwordComplexityOptions = {
	min: 6,
	max: 30,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 6,
};

export const changeUserPasswordSchema = Joi.object({
	email: Joi.string().email({ tlds: { allow: false } }),
	password1: JoiPasswordComplexity(passwordComplexityOptions, 'New Password')
		.required()
		.label('New Password'),
	password2: Joi.string().required().label('Confirm Password'),
});
