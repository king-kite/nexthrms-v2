import { array, object, string } from 'yup';

export const multipleDeleteSchema = object({
	values: array().of(string().uuid().required()).required(),
});

export const multipleEmailSchema = object({
	emails: array().of(string().email().required()).required().label('Emails'),
});

export const uuidSchema = string().uuid().required().label('id');
