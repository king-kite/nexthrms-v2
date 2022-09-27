import Joi from 'joi';

export const attendanceActionSchema = Joi.object({
	action: Joi.string().valid('IN', 'OUT').required().label('Action'),
});
