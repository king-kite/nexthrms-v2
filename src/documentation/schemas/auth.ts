import { userEmployeeProperties, userProfileProperties } from './properties';
import * as refs from '../refs';

import { models } from '../../config';

export const AuthUserDataModel = {
	type: 'object',
	required: ['email', 'firstName', 'lastName', 'fullName'],
	properties: {
		email: {
			type: 'string',
			format: 'email',
			example: 'johndoe@kitehrms.com',
			description: "The user's email",
		},
		firstName: {
			type: 'string',
			example: 'John',
			description: "The user's first name",
		},
		fullName: {
			type: 'string',
			example: 'John Doe',
			description: "The user's first name + The user's last name",
		},
		lastName: {
			type: 'string',
			example: 'Doe',
			description: "The user's last name",
		},
		isAdmin: {
			type: 'boolean',
			example: false,
			nullable: true,
		},
		isSuperUser: {
			type: 'boolean',
			example: false,
			nullable: true,
		},
		profile: {
			type: 'object',
			nullable: true,
			required: ['image'],
			description: "An object containing the user's profile information",
			properties: {
				image: {
					type: 'object',
					nullable: true,
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
						},
						url: {
							type: 'string',
						},
					},
				},
			},
		},
		employee: {
			type: 'object',
			nullable: true,
			required: ['id'],
			description: 'Information if the user is an employee.',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
					description: "The user's employee ID",
				},
				job: {
					type: 'object',
					nullable: true,
					required: ['name'],
					description: 'Information about the employee job.',
					properties: {
						name: {
							type: 'string',
							description: 'The name of the employee job',
						},
					},
				},
			},
		},
		permissions: {
			type: 'array',
			items: {
				$ref: refs.PERMISSION,
			},
		},
		objPermissions: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					modelName: {
						type: 'string',
						format: JSON.stringify(models)
							.replace('[', '(')
							.replace(']', ')')
							.replaceAll(',', ' | '),
					},
					permission: {
						type: 'string',
						format: 'DELETE | EDIT | VIEW',
					},
				},
			},
		},
	},
};

export const LoginErrorModel = {
	type: 'object',
	nullable: true,
	properties: {
		email: {
			type: 'string',
			nullable: true,
		},
		password: {
			type: 'string',
			nullable: true,
		},
	},
};

export const UserProfileDataModel = {
	type: 'object',
	required: ['email', 'firstName', 'lastName', 'isEmailVerified'],
	properties: {
		isEmailVerified: {
			type: 'boolean',
			description: "The user's email verification status",
		},
		...userProfileProperties,
		employee: {
			type: 'object',
			nullable: true,
			required: ['id'],
			description: 'Information if the user is an employee.',
			properties: userEmployeeProperties,
		},
	},
	example: {
		firstName: 'Jan',
		lastName: 'Doe',
		email: 'jandoe@kitehrms.com',
		isEmailVerified: true,
		profile: {
			dob: '2001-03-14T00:00:00.000Z',
			gender: 'MALE',
			image: {
				id: '1234th-5678-0987-23erfgbnm3',
				url: '/media/users/profile/jan_doe_jandoe@kitehrms.com_1669361137919.jpg',
			},
			address: 'This is my Home Address. Please leave a note or letter',
			city: 'New City',
			phone: '08123456789',
			state: 'New Town',
		},
		employee: {
			dateEmployed: '2022-10-29T08:31:54.808Z',
			department: null,
			job: {
				name: 'CEO',
			},
			supervisor: null,
			leaves: [],
		},
	},
};
