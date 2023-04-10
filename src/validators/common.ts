import Joi from 'joi';

export const multipleDeleteSchema = Joi.object({
	values: Joi.array().items(Joi.string().uuid()).required(),
});

export const multipleEmailSchema = Joi.object({
	emails: Joi.array()
		.items(Joi.string().email({ tlds: { allow: false } }))
		.required()
		.label('Emails'),
});

export const uuidSchema = Joi.string().uuid().required().label('id');
