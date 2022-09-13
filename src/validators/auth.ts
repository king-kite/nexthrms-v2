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

export const registerSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email Address'),
	password: JoiPasswordComplexity(passwordComplexityOptions, 'Password')
		.required()
		.label('Password'),
	firstName: Joi.string().optional().label('First Name'),
	lastName: Joi.string().optional().label('Last Name'),
});

export const loginSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email Address'),
	password: Joi.string().required().label('Password'),
});

export const passwordChangeSchema = Joi.object({
	oldPassword: Joi.string().required().label('Old Password'),
	newPassword1: JoiPasswordComplexity(passwordComplexityOptions, 'New Password')
		.required()
		.label('New Password'),
	newPassword2: Joi.string().required().label('Confirm Password'),
});

export const passwordResetSchema = Joi.object({
	uid: Joi.string().required().label('uid'),
	token: Joi.string().required().label('token'),
	password1: JoiPasswordComplexity(passwordComplexityOptions, 'New Password')
		.required()
		.label('New Password'),
	password2: Joi.string().required().label('Confirm Password'),
});

export const profileUpdateSchema = Joi.object({
	firstName: Joi.string().required().label('First Name'),
	lastName: Joi.string().required().label('Last Name'),
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email'),
	profile: {
		phone: Joi.string().required().label('Phone Number'),
		gender: Joi.string().valid('MALE', 'FEMALE').optional().label('Gender'),
		image: Joi.string().optional().allow('').label('Image'),
		address: Joi.string().optional().allow('').label('Address'),
		state: Joi.string().optional().allow('').label('State'),
		city: Joi.string().optional().allow('').label('City'),
		dob: Joi.date().optional().label('Date of Birth'),
	},
});

export const verifyUidTokenSchema = Joi.object({
	uid: Joi.string().required().label('uid'),
	token: Joi.string().required().label('token'),
});
