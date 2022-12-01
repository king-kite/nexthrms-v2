import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import { ASSET_URL, ASSETS_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
	BaseResponseType,
	AssetType,
	CreateAssetErrorResponseType,
	CreateAssetResponseType,
	GetAssetsResponseType,
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get assets
export function useGetAssetsQuery(
	{
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetAssetsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetAssetsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.ASSETS, { limit, offset, search }],
		() =>
			axiosInstance
				.get(`${ASSETS_URL}?limit=${limit}&offset=${offset}&search=${search}`)
				.then(
					(response: AxiosResponse<GetAssetsResponseType>) => response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get assets.',
					});
			},
			...options,
		}
	);
	return query;
}

// create asset mutation
export function useCreateAssetMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: AssetType) => void;
	}
) {
	const queryAsset = useQueryClient();

	const mutation = useMutation(
		(data: FormData) =>
			axiosInstance
				.post(ASSETS_URL, data)
				.then(
					(response: AxiosResponse<CreateAssetResponseType>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryAsset.invalidateQueries([tags.ASSETS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete asset mutation
export function useDeleteAssetMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: BaseResponseType) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryAsset = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(id: string) =>
			axiosInstance
				.delete(ASSET_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryAsset.invalidateQueries([tags.ASSETS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete asset',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteAsset = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Asset?',
				color: 'warning',
				message: 'Do you want to delete asset?',
				decisions: [
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						caps: true,
						onClick: close,
						title: 'cancel',
					},
					{
						bg: 'bg-red-600 hover:bg-red-500',
						caps: true,
						onClick: () => {
							showLoader();
							mutate(id);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { deleteAsset, ...mutation };
}

// edit asset mutation
export function useEditAssetMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: CreateAssetErrorResponseType;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: AssetType) => void;
	}
) {
	const queryAsset = useQueryClient();

	const mutation = useMutation(
		(data: { id: string; form: FormData }) =>
			axiosInstance
				.put(ASSET_URL(data.id), data.form)
				.then(
					(response: AxiosResponse<CreateAssetResponseType>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryAsset.invalidateQueries([tags.ASSETS]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateAssetErrorResponseType>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}
