import { PaginatedResponseType } from './base';

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

export type CreateManagedFileType = {
	name: string;
	directory: string; // '' if empty
	file?: any; // File
	type: 'file' | 'folder';
};

export type CreateManagedFileErrorType = {
	name?: string;
	directory?: string;
	file?: string;
	type?: string;
};

export type GetManagedFilesResponseType = PaginatedResponseType<
	ManagedFileType[]
>;
