import { SuccessResponseType } from './base';

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

	updatedAt: Date | string;
	createdAt: Date | string;
};

export type AssetCreateQueryType = {
	assetId: string;
	condition: 'BAD' | 'GOOD' | 'EXCELLENT';
	description?: string;
	model?: string;
	manufacturer: string;
	name: string;
	purchaseDate: string;
	purchaseFrom: string;
	serialNo: string;
	status: 'APPROVED' | 'DENIED' | 'PENDING' | 'RETURNED';
	supplier: string;
	warranty: number;
	value: number;
	userId: string;
};

export type AssetImportQueryType = {
	id?: string;
	asset_id: string;
	condition: 'BAD' | 'GOOD' | 'EXCELLENT';
	description?: string | null;
	model?: string | null;
	manufacturer: string;
	name: string;
	purchase_date: string;
	purchase_from: string;
	serial_no: string;
	status: 'APPROVED' | 'DENIED' | 'PENDING' | 'RETURNED';
	supplier: string;
	warranty: number;
	value: number;
	user: string;
	updated_at?: Date | string;
	created_at?: Date | string;
};

export type CreateAssetErrorResponseType = {
	assetId?: string;
	condition?: string;
	description?: string;
	model?: string;
	manufacturer?: string;
	name?: string;
	purchaseDate?: string;
	purchaseFrom?: string;
	serialNo?: string;
	status?: string;
	supplier?: string;
	warranty?: string;
	value?: string;
	userId?: string;
};

export type CreateAssetResponseType = SuccessResponseType<AssetType>;

export type GetAssetsResponseType = SuccessResponseType<{
	result: AssetType[];
	total: number;
}>;
