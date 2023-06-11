import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import {
	MANAGED_FILES_URL,
	MANAGED_FILE_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
	BaseResponseType,
	GetManagedFilesResponseType,
	ManagedFileType,
} from '../../types';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

// get managed files query
export function useGetManagedFilesQuery(
	{
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		from,
		to,
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		from?: string;
		to?: string;
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: { total: number; result: ManagedFileType[] }) => void;
		onError?: (err: unknown) => void;
		initialData?: () => { total: number; result: ManagedFileType[] };
	}
) {
	const query = useQuery(
		[tags.MANAGED_FILES, { limit, offset, search }],
		() => {
			let url =
				MANAGED_FILES_URL + `?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) url += `&from=${from}&to=${to}`;
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetManagedFilesResponseType>) =>
						response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get files.',
					});
			},
			...options,
		}
	);
	return query;
}

// delete managed file mutation
export function useDeleteManagedFileMutation(
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

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(id: string) =>
			axiosInstance
				.delete(MANAGED_FILE_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.MANAGED_FILES]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete file.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteFile = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete File?',
				color: 'danger',
				message: 'Do you want to delete this file?',
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

	return { deleteFile, ...mutation };
}
