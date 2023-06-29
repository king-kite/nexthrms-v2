import { InferType, date, number, object, string } from 'yup';

export const attendanceActionSchema = object({
	action: string().oneOf(['IN', 'OUT']).required().label('Action'),
});

export const attendanceCreateSchema = object({
	employee: string().uuid().required().label('Employee ID'),
	date: date().required().label('Date'),
	punchIn: date().required().label('Punch In'),
	punchOut: date().nullable().optional().label('Punch Out'),
});

export type AttendanceCreateType = InferType<typeof attendanceCreateSchema>;
export type AttendanceActionType = InferType<typeof attendanceActionSchema>;
