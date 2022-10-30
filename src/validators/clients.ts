import Joi from 'joi';

export const createClientSchema = Joi.object({
	company: Joi.string().required().label('Company'),
	position: Joi.string().required().label('Position'),
	contact: Joi.object({
		firstName: Joi.string().required().label('First Name'),
		lastName: Joi.string().required().label('Last Name'),
		email: Joi.string()
			.email({ tlds: { allow: false } })
			.required()
			.label('Email Address'),
		profile: Joi.object({
			phone: Joi.string().required().label('Phone Number'),
			gender: Joi.string().valid('MALE', 'FEMALE').optional().label('Gender'),
			image: Joi.any().optional().allow('').label('Image'), // File
			address: Joi.string().optional().allow('').label('Address'),
			state: Joi.string().optional().allow('').label('State'),
			city: Joi.string().optional().allow('').label('City'),
			dob: Joi.date().optional().allow('').label('Date of Birth'),
		})
			.required()
			.label('Profile'),
	})
		.required()
		.allow(null)
		.label('Contact'),
	contactId: Joi.string().uuid().required().allow(null).label('Contact ID'),
});
