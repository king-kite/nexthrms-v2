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
