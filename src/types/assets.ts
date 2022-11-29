export type AssetType = {
	id: string;

	assetId: string;
	condition: 'BAD' | 'GOOD' | 'EXCELLENT';
	description?: string | null;
	model?: string | null;
	manufacturer: string;
	name: string;
	purchaseDate: string;
	purchaseFrom: string;
	serialNo: string;
	status: 'APPROVED' | 'DENIED' | 'PENDING' | 'RETURNED';
	supplier: string;
	warranty: number;
	value: number;

	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		profile: {
			image: string;
		};
	};

	updatedAt: string;
};
