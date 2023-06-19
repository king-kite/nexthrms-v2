import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import {
	MANAGED_FILES_URL,
	MANAGED_FILE_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import {
	BaseResponseType,
	CreateManagedFileErrorType,
	GetManagedFilesResponseType,
	ManagedFileType,
	SuccessResponseType,
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
		[tags.MANAGED_FILES, { limit, offset, search, from, to }],
		async () => {
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

// create employee mutation
export function useCreateManagedFileMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: {
			status: number;
			data?: CreateManagedFileErrorType | undefined;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ManagedFileType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: FormData) =>
			axiosInstance
				.post(MANAGED_FILES_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ManagedFileType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.MANAGED_FILES]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					if (options?.onError) {
						const error = handleAxiosErrors<CreateManagedFileErrorType>(err);
						if (error) options.onError(error);
					}
				}
			},
			...queryOptions,
		}
	);

	return mutation;
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

	const { open } = useAlertContext();

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
				else {
					open({
						message: 'File deleted successfully!',
						type: 'success',
					});
				}
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete file.',
					});
				} else {
					const error = handleAxiosErrors(err);
					open({
						message:
							error?.message || 'An error occurred. Unable to delete file.',
						type: 'danger',
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

// delete multiple managed file mutation
export function useDeleteMultipleManagedFileMutation(
	options?: {
		type?: 'folder' | 'file';
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

	const { open } = useAlertContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(data: { files?: string[]; folder?: string }) =>
			axiosInstance({
				url: MANAGED_FILES_URL,
				method: 'DELETE',
				data,
			}).then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.MANAGED_FILES]);
				if (options?.onSuccess) options.onSuccess();
				else {
					open({
						message:
							'A notification will be sent to you when the task is completed. \nDo note that only files you are authorized to remove will be deleted.',
						type: 'success',
					});
				}
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							`An error occurred. Unable to delete ${
								options?.type === 'folder' ? 'folder' : 'files'
							}.`,
					});
				} else {
					const error = handleAxiosErrors(err);
					open({
						message:
							error?.message ||
							`An error occurred. Unable to delete ${
								options?.type === 'folder' ? 'folder' : 'files'
							}.`,
						type: 'danger',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteFiles = React.useCallback(
		(data: { files?: string[]; folder?: string }) => {
			openModal({
				closeOnButtonClick: false,
				header: data.files ? 'Delete Files?' : 'Delete Folder?',
				color: 'danger',
				message: `Do you want to delete ${
					data.folder ? 'this folder' : 'these files'
				}?`,
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
							mutate(data);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { deleteFiles, ...mutation };
}

// edit managed file mutation
export function useEditManagedFileMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (data: ManagedFileType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(params: { id: string; data: { name: string } }) =>
			axiosInstance
				.put(MANAGED_FILE_URL(params.id), params.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ManagedFileType>>) =>
						response.data.data
				),
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
							error?.message || 'An error occurred. Unable to edit file.',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}
