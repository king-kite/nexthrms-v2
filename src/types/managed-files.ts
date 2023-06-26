import { PaginatedResponseType, ValidatorErrorType } from './base';
import type { CreateManagedFileType as ManagedFileCreateType } from '../validators/managed-files';

export type { DeleteManagedFilesType } from '../validators/managed-files';

export type ManagedFileType = {
	id: string;
	name: string;
	url: string;
	size: number;
	storageInfo?: {
		location?: string;
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
				url: string;
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

export type ManagedFileImportQueryType = {
	id?: string | null;
	name: string;
	url: string;
	size: number;
	storage_info_keys?: string | null;
	storage_info_values?: string | null;
	type: string;
	user_id?: string | null;
	created_at?: Date | string | null;
	updated_at?: Date | string | null;
};

export type CreateManagedFileType = ManagedFileCreateType;
export type CreateManagedFileErrorType =
	ValidatorErrorType<CreateManagedFileType>;

export type GetManagedFilesResponseType = PaginatedResponseType<
	ManagedFileType[]
>;
