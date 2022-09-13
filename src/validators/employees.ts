import Joi from 'joi';

export const createEmployeeSchema = Joi.object({
	department: Joi.string().uuid().required().label('Job'),
	job: Joi.string().uuid().required().label('Job'),
	supervisor: Joi.string().uuid().optional().allow('').label('Supervisor'),
	dateEmployed: Joi.date().optional().allow('').label('Date Employed'),
	user: Joi.object({
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.label('Email Address'),
		firstName: Joi.string().required().label('First Name'),
		lastName: Joi.string().required().label('Last Name'),
		profile: Joi.object({
			image: Joi.string().optional().allow('').label('Image'),
			phone: Joi.string().required().label('Phone Number'),
			gender: Joi.string().valid('MALE', 'FEMALE').required().label('Gender'),
			address: Joi.string().required().label('Address'),
			state: Joi.string().required().label('State'),
			city: Joi.string().required().label('City'),
			dob: Joi.date().required().label('Date of Birth'),
		})
			.required()
			.label('Profile'),
	})
		.optional()
		.allow(null),
	userId: Joi.string().uuid().optional().allow(null).label('User ID'),
});
