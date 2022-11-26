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

export const createUserSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email Address'),
	firstName: Joi.string().required().label('First Name'),
	lastName: Joi.string().required().label('Last Name'),
	profile: Joi.object({
		image: Joi.any().optional().allow('').label('Image'), // File
		phone: Joi.string().required().label('Phone Number'),
		gender: Joi.string().valid('MALE', 'FEMALE').required().label('Gender'),
		address: Joi.string().required().label('Address'),
		state: Joi.string().required().label('State'),
		city: Joi.string().required().label('City'),
		dob: Joi.date().required().label('Date of Birth'),
	})
		.required()
		.label('Profile'),
	employee: Joi.object({
		department: Joi.string().uuid().required().label('Department'),
		job: Joi.string().uuid().required().label('Job'),
		supervisor: Joi.string().uuid().optional().allow('').label('Supervisor'),
		dateEmployed: Joi.date().optional().allow('').label('Date Employed'),
	})
		.optional()
		.allow('', null)
		.label('Employee'),
	client: Joi.object({
		company: Joi.string().required().label('Company'),
		position: Joi.string().required().label('Position'),
	})
		.optional()
		.allow('', null)
		.label('Client'),
});
