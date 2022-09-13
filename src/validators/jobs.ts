import Joi from 'joi';

export const createJobSchema = Joi.object({
	name: Joi.string().required().label('Name'),
});
