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
	createdAt: Date | string;
	updatedAt: Date | string;
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
