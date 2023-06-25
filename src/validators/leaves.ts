import { InferType, date, object, string } from 'yup';

export const leaveCreateSchema = object({
	employee: string().uuid().nullable().optional().label('Employee ID'),
	reason: string().required().label('Reason'),
	startDate: date().required().label('Start Date'),
	endDate: date().required().label('End Date'),
	type: string()
		.required()
		.oneOf([
			'ANNUAL',
			'CASUAL',
			'HOSPITALIZATION',
			'LOP',
			'MATERNITY',
			'PATERNITY',
			'SICK',
		])
		.label('Type'),
});

export const leaveApprovalSchema = object({
	approval: string().required().oneOf(['APPROVED', 'DENIED']).label('Approval'),
});

export type LeaveCreateType = InferType<typeof leaveCreateSchema>;
export type LeaveApprovalType = InferType<typeof leaveApprovalSchema>;
