import { InferType, array, date, mixed, object, string } from 'yup';

export const createEmployeeSchema = object({
	department: string().uuid().required().label('Department'),
	job: string().uuid().required().label('Job'),
	supervisors: array()
		.of(string().uuid().required())
		.nullable()
		.optional()
		.label('Supervisors'),
	dateEmployed: date().nullable().optional().label('Date Employed'),
	user: object({
		email: string().email().required().label('Email Address'),
		firstName: string().required().label('First Name'),
		lastName: string().required().label('Last Name'),
		profile: object({
			image: mixed().nullable().optional().label('Image'), // File
			phone: string().required().label('Phone Number'),
			gender: string().oneOf(['MALE', 'FEMALE']).required().label('Gender'),
			address: string().required().label('Address'),
			state: string().required().label('State'),
			city: string().required().label('City'),
			dob: date().required().label('Date of Birth'),
		})
			.required()
			.label('Profile'),
	})
		.nullable()
		.optional()
		.label('User'),
	userId: string().uuid().nullable().optional().label('User ID'),
});

export type CreateEmployeeType = InferType<typeof createEmployeeSchema>;
