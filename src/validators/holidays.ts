import Joi from 'joi';

export const createHolidaySchema = Joi.object({
	name: Joi.string().required().label('Name'),
	date: Joi.date().required().label('Date'),
});
