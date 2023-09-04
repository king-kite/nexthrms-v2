import {} from '@prisma/client';

import {
	ResponseType,
	PermissionModelChoices,
	PermissionObjectChoices,
	ValidatorErrorType,
	SuccessResponseType,
} from './base';
import { PermissionType } from './users';
import type { ProfileUpdateType as ValidatorProfileUpdateType } from '../validators/auth';

export type { PasswordResetType } from '../validators/auth';

export interface AuthDataType extends UserDataType {
	fullName: string;
	profile: {
		image: {
			id: string;
			url: string;
		} | null;
	} | null;
	employee?: {
		id: string;
		job?: {
			name: string;
		} | null;
	} | null;
	permissions: PermissionType[];
	objPermissions: {
		modelName: PermissionModelChoices;
		permission: PermissionObjectChoices;
	}[];
	isSuperUser?: boolean;
	isAdmin?: boolean;
}

export type ProfileType = {
	firstName: string;
	lastName: string;
	email: string;
	isEmailVerified: boolean;
	profile: {
		dob: Date | string | null;
		gender: 'MALE' | 'FEMALE';
		image: {
			id: string;
			url: string;
		} | null;
		address: string | null;
		city: string | null;
		phone: string | null;
		state: string | null;
	} | null;
	employee: {
		id: string;
		dateEmployed: Date | string;
		department: {
			name: string;
			hod: {
				user: {
					firstName: string;
					lastName: string;
					email: string;
					profile: {
						image: {
							id: string;
							url: string;
						} | null;
					} | null;
					employee: {
						department: {
							id: string;
							name: string;
						} | null;
					};
				};
			} | null;
		} | null;
		job: {
			name: string;
		} | null;
		supervisors: {
			user: {
				firstName: string;
				lastName: string;
				email: string;
				profile: {
					image: {
						id: string;
						url: string;
					} | null;
				} | null;
				employee: {
					department: {
						id: string;
						name: string;
					} | null;
				};
			};
		}[];
		leaves: {
			startDate: Date | string;
			endDate: Date | string;
			reason: string;
			type: string;
			approved: boolean;
		}[];
	} | null;
};

export type ProfileUpdateType = ValidatorProfileUpdateType;

type ProfileErrorType = ValidatorErrorType<ProfileUpdateType['profile']>;

export type ProfileUpdateErrorResponseType = {
	firstName?: string;
	lastName?: string;
	email?: string;
	profile?: ProfileErrorType;
};

export type UserDataType = {
	firstName: string;
	lastName: string;
	email: string;
};

export type RegisterResponseType = ResponseType<null | {
	email?: string;
	password?: string;
}>;

export type ProfileResponseType = SuccessResponseType<ProfileType>;
