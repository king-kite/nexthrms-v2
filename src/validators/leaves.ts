import Joi from 'joi';

export const leaveCreateSchema = Joi.object({
	employee: Joi.string().uuid().optional().allow('').label('Employee ID'),
	reason: Joi.string().required().label('Reason'),
	startDate: Joi.date().required().label('Start Date'),
	endDate: Joi.date().required().label('End Date'),
	type: Joi.string()
		.required()
		.valid(
			'ANNUAL',
			'CASUAL',
			'HOSPITALIZATION',
			'LOP',
			'MATERNITY',
			'PATERNITY',
			'SICK'
		)
		.label('Leave Type'),
});

export const leaveApprovalSchema = Joi.object({
	approval: Joi.string()
		.required()
		.valid('APPROVED', 'DENIED')
		.label('Approval'),
});
