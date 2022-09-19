import Joi from 'joi';

export const overtimeCreateSchema = Joi.object({
	employee: Joi.string().uuid().optional().allow('').label('Employee ID'),
	reason: Joi.string().required().label('Reason'),
	date: Joi.date().required().label('Date'),
	hours: Joi.number().required().label('Hours'),
	type: Joi.string()
		.required()
		.valid('COMPULSORY', 'HOLIDAY', 'VOLUNTARY')
		.label('Leave Type'),
});

export const overtimeApprovalSchema = Joi.object({
	approval: Joi.string()
		.required()
		.valid('APPROVED', 'DENIED')
		.label('Approval'),
});
