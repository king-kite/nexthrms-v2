import { BaseResponseType, SuccessResponseType } from './base';

export interface AuthDataType extends UserDataType {
	fullName: string;
	profile: {
		image: string;
	} | null;
	employee?: {
		id: string;
		job?: {
			name: string;
		} | null;
	} | null;
}

export type ProfileType = {
	firstName: string;
	lastName: string;
	email: string;
	isEmailVerified: boolean;
	profile: {
		dob: Date | string | null;
		gender: 'MALE' | 'FEMALE';
		image: string;
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
						image: string;
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
		supervisor: {
			user: {
				firstName: string;
				lastName: string;
				email: string;
				profile: {
					image: string;
				} | null;
				employee: {
					department: {
						id: string;
						name: string;
					} | null;
				};
			};
		} | null;
		leaves: {
			startDate: Date | string;
			endDate: Date | string;
			reason: string;
			type: string;
			approved: boolean;
		}[];
	} | null;
};

export type ProfileUpdateType = {
	firstName: string;
	lastName: string;
	email: string;
	profile: {
		phone: string;
		image: string;
		gender: 'MALE' | 'FEMALE';
		address: string;
		state: string;
		city: string;
		dob: string;
	};
};

export type ProfileUpdateErrorResponseType = {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	image?: string;
	gender?: string;
	address?: string;
	state?: string;
	city?: string;
	dob?: string;
};

export type UserDataType = {
	firstName: string;
	lastName: string;
	email: string;
};

export type RegisterResponseType = BaseResponseType<
	null,
	{
		email?: string;
		password?: string;
	}
>;

export type ProfileResponseType = SuccessResponseType<ProfileType>;
