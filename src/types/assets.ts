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
			image: string;
		};
	} | null;

	updatedAt: string;
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
