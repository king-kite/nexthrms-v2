import Joi from 'joi';

export const attendanceActionSchema = Joi.object({
	action: Joi.string().valid('IN', 'OUT').required().label('Action'),
});

export const attendanceCreateSchema = Joi.object({
	employee: Joi.string().uuid().required().label('Employee ID'),
	date: Joi.date().required().label('Date'),
	punchIn: Joi.date().required().label('Punch In'),
	punchOut: Joi.date().optional().allow('').label('Punch Out'),
	overtime: Joi.object({
		hours: Joi.number().required().label('Overtime Hours'),
		reason: Joi.string().required().label('Overtime Reason'),
	})
		.optional()
		.allow('')
		.label('Overtime'),
});
