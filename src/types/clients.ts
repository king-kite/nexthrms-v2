import { SuccessResponseType } from './base';

export type ClientType = {
	id: string;
	company: string;
	position: string;
	contact: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		profile: {
			image: string;
			gender: 'MALE' | 'FEMALE';
			city: string | null;
			address: string | null;
			dob: Date | null;
			phone: string | null;
			state: string | null;
		} | null;
		isActive: boolean;
	};
	updatedAt: Date | string;
	createdAt: Date | string;
};

export type ClientImportQueryType = {
	id?: string | null;
	company: string;
	position: string;
	contact_id?: string;
	first_name: string;
	last_name: string;
	email: string;
	image?: string;
	gender: 'MALE' | 'FEMALE';
	city?: string | null;
	address?: string | null;
	dob?: Date | null;
	phone?: string | null;
	state?: string | null;
	updated_at?: Date | string;
	created_at?: Date | string;
};

export type ClientCreateQueryType = {
	company: string;
	position: string;
	contact: {
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
	} | null;
	contactId: string | null;
};

export type CreateClientErrorResponseType = {
	company?: string;
	position?: string;
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
	contactId?: string;
};

export type CreateClientResponseType = SuccessResponseType<ClientType>;

export type GetClientsResponseType = SuccessResponseType<{
	result: ClientType[];
	total: number;
	active: number;
	inactive: number;
}>;
