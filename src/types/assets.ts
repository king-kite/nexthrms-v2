import { ValidatorErrorType, SuccessResponseType } from './base';
import { AssetCreateType } from '../validators/assets';

export type AssetType = {
	id: string;
	assetId: true;
	condition: 'BAD' | 'GOOD' | 'EXCELLENT';
	description: string | null;
	model: string | null;
	manufacturer: string;
	name: string;
	purchaseDate: Date | string;
	purchaseFrom: string;
	serialNo: string;
	status: 'APPROVED' | 'DENIED' | 'PENDING' | 'RETURNED';
	supplier: string;
	warranty: number;
	value: number;
	user: {
		id: string;
		firstName: true;
		lastName: true;
		email: string;
		profile: {
			image: {
				id: string;
				location: string;
				url: string | null;
			} | null;
		} | null;
	} | null;
	updatedAt: true;
	createdAt: true;
};

export type AssetCreateQueryType = Omit<AssetCreateType, 'purchaseDate'> & {
	purchaseDate: Date | string;
};

export type CreateAssetErrorResponseType = ValidatorErrorType<AssetCreateQueryType>;

export type CreateAssetResponseType = SuccessResponseType<AssetType>;

export type GetAssetsResponseType = SuccessResponseType<{
	result: AssetType[];
	total: number;
}>;
