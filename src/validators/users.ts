import Joi from 'joi';
import JoiPasswordComplexity from 'joi-password-complexity';

const passwordComplexityOptions = {
	min: 6,
	max: 30,
	lowerCase: 1,
	upperCase: 1,
	numeric: 1,
	symbol: 1,
	requirementCount: 6,
};

export const changeUserPasswordSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email'),
	password1: JoiPasswordComplexity(passwordComplexityOptions, 'New Password')
		.required()
		.label('New Password'),
	password2: Joi.string().required().label('Confirm Password'),
});

export const createGroupSchema = Joi.object({
	name: Joi.string().required().label('Name'),
	description: Joi.string().optional().allow('').label('Description'),
	active: Joi.boolean().optional().label('Active'),
	permissions: Joi.array().items(Joi.string()).optional().label('Permissions'),
	users: Joi.array().items(Joi.string().uuid()).optional().label('Users'),
});

export const createPermissionSchema = Joi.object({
	codename: Joi.string().required().label('Code Name'),
	description: Joi.string().optional().allow('', null).label('Description'),
	categoryId: Joi.string().uuid().optional().allow('', null).label('Category'),
	name: Joi.string().required().label('Name'),
});

export const createPermissionCategorySchema = Joi.object({
	name: Joi.string().required().label('Name'),
});

export const createUserSchema = Joi.object({
	email: Joi.string()
		.email({ tlds: { allow: false } })
		.required()
		.label('Email Address'),
	firstName: Joi.string().required().label('First Name'),
	lastName: Joi.string().required().label('Last Name'),
	createdAt: Joi.date().required().label('Date Joined'),
	isAdmin: Joi.boolean().optional().label('Is Admin'),
	isActive: Joi.boolean().optional().label('Is Active'),
	isSuperUser: Joi.boolean().optional().label('Is Super User'),
	isEmailVerified: Joi.boolean().optional().label('Is Email Verified'),
	profile: Joi.object({
		image: Joi.any().optional().allow('').label('Image'), // File
		phone: Joi.string().required().label('Phone Number'),
		gender: Joi.string().valid('MALE', 'FEMALE').required().label('Gender'),
		address: Joi.string().required().label('Address'),
		state: Joi.string().required().label('State'),
		city: Joi.string().required().label('City'),
		dob: Joi.date().required().label('Date of Birth'),
	})
		.required()
		.label('Profile'),
	employee: Joi.object({
		department: Joi.string().uuid().required().label('Department'),
		job: Joi.string().uuid().required().label('Job'),
		supervisor: Joi.string().uuid().optional().allow('').label('Supervisor'),
		dateEmployed: Joi.date().optional().allow('').label('Date Employed'),
	})
		.optional()
		.allow('', null)
		.label('Employee'),
	client: Joi.object({
		company: Joi.string().required().label('Company'),
		position: Joi.string().required().label('Position'),
	})
		.optional()
		.allow('', null)
		.label('Client'),
});

export const updateUserGroupsSchema = Joi.object({
	groups: Joi.array().items(Joi.string().uuid()).required().label('Groups'),
});

export const updateUserPermissionsSchema = Joi.object({
	permissions: Joi.array().items(Joi.string()).required().label('Permissions'),
});
