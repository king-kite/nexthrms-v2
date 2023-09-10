import { ValidatorErrorType, SuccessResponseType } from './base';
import { CreateClientType } from '../validators/clients';

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
			image: {
				id: string;
				location: string;
				url: string | null;
			} | null;
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

export type ClientCreateQueryType = CreateClientType;
export type ClientCreateProfileErrorType = ValidatorErrorType<ClientType['contact']['profile']>;

export type CreateClientErrorResponseType = ValidatorErrorType<CreateClientType> & {
	contact?: ValidatorErrorType<CreateClientType['contact']> & {
		profile?: ClientCreateProfileErrorType;
	};
};

export type CreateClientResponseType = SuccessResponseType<ClientType>;

export type GetClientsResponseType = SuccessResponseType<{
	result: ClientType[];
	total: number;
	active: number;
	inactive: number;
}>;
