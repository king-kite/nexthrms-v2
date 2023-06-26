import { InferType, date, mixed, object, string } from 'yup';

export const passwordOptions = string()
	.min(6, 'Password must be at least 6 characters')
	.max(30, 'Password must not exceed 30 characters')
	.matches(/[a-z]/, 'Password must contain at least one lowercase letter')
	.matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.matches(/[0-9]/, 'Password must contain at least one numeric character')
	.matches(/[^a-zA-Z0-9]/, 'Password must contain at least one symbol');

export const registerSchema = object({
	email: string().email().required().lowercase().trim().label('Email Address'),
	password: passwordOptions.required().label('Password'),
	firstName: string().optional().label('First Name'),
	lastName: string().optional().label('Last Name'),
});

export const loginSchema = object({
	email: string().email().required().label('Email Address'),
	password: string().required().label('Password'),
});

export const passwordChangeSchema = object({
	oldPassword: string().required().label('Old Password'),
	newPassword1: passwordOptions.required().label('New Password'),
	newPassword2: string().required().label('Confirm Password'),
});

export const passwordResetSchema = object({
	uid: string().required().label('uid'),
	token: string().required().label('token'),
	password1: passwordOptions.required().label('New Password'),
	password2: string().required().label('Confirm Password'),
});

export const profileUpdateSchema = object({
	firstName: string().required().label('First Name'),
	lastName: string().required().label('Last Name'),
	email: string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email'),
	profile: object({
		phone: string().required().label('Phone Number'),
		gender: string().oneOf(['MALE', 'FEMALE']).optional().label('Gender'),
		image: mixed().nullable().optional().label('Image'), // File
		address: string().nullable().optional().label('Address'),
		state: string().nullable().optional().label('State'),
		city: string().nullable().optional().label('City'),
		dob: date().nullable().optional().label('Date of Birth'),
	}),
});

export const verifyUidTokenSchema = object({
	uid: string().required().label('uid'),
	token: string().required().label('token'),
});

export type PasswordResetType = InferType<typeof passwordResetSchema>;
export type ProfileUpdateType = InferType<typeof profileUpdateSchema>;
