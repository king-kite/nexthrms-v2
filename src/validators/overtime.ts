import { InferType, date, number, object, string } from 'yup';

export const overtimeCreateSchema = object({
	employee: string()
		.uuid('Employee ID is not valid.')
		.nullable()
		.optional()
		.label('Employee ID'),
	reason: string().trim().required().label('Reason'),
	date: date().required().label('Date'),
	hours: number().min(0).required().label('Hours'),
	type: string()
		.oneOf(['COMPULSORY', 'HOLIDAY', 'VOLUNTARY'])
		.required()
		.label('Type'),
});

export const overtimeApprovalSchema = object({
	approval: string().required().oneOf(['APPROVED', 'DENIED']).label('Approval'),
});

export type OvertimeCreateType = InferType<typeof overtimeCreateSchema>;
export type OvertimeApprovalType = InferType<typeof overtimeApprovalSchema>;
