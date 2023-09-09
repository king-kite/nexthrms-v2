import { PaginatedResponseType, ValidatorErrorType } from './base';
import type { CreateManagedFileType as ManagedFileCreateType } from '../validators/managed-files';

export type { DeleteManagedFilesType } from '../validators/managed-files';

export type ManagedFileType = {
	id: string;
	name: string;
	location: string;
	url?: string;
	size: number;
	storageInfo?: {
		public_id?: string;
		name?: string;
		type?: string;
	} | null;
	type: string;
	user?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		profile: {
			image: {
				id: string;
				location: string;
				url?: string;
			} | null;
		} | null;
	} | null;
	profile?: {
		id: string;
	} | null;
	projectFile?: {
		id: string;
	} | null;
	createdAt: Date | string;
	updatedAt: Date | string;
};

export type CreateManagedFileType = ManagedFileCreateType;
export type CreateManagedFileErrorType = ValidatorErrorType<CreateManagedFileType>;

export type GetManagedFilesResponseType = PaginatedResponseType<ManagedFileType[]>;
