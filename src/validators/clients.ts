import { InferType, date, mixed, object, string } from 'yup';

export const createClientSchema = object({
	company: string().required().label('Company'),
	position: string().required().label('Position'),
	contact: object({
		firstName: string().required().label('First Name'),
		lastName: string().required().label('Last Name'),
		email: string().email().required().label('Email Address'),
		profile: object({
			phone: string().required().label('Phone Number'),
			gender: string().oneOf(['MALE', 'FEMALE']).optional().label('Gender'),
			image: mixed().nullable().optional().label('Image'), // File
			address: string().nullable().optional().label('Address'),
			state: string().nullable().optional().label('State'),
			city: string().nullable().optional().label('City'),
			dob: date().nullable().optional().label('Date of Birth'),
		})
			.required()
			.label('Profile'),
	})
		.nullable()
		.label('Contact'),
	contactId: string().uuid().nullable().label('Contact ID'),
});

export type CreateClientType = InferType<typeof createClientSchema>;
