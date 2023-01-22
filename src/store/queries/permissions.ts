import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import { GROUPS_URL, PERMISSIONS_URL, DEFAULT_PAGINATION_SIZE, GROUP_URL } from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
  CreateGroupQueryType,
  CreateGroupErrorResponseType,
	GroupType,
  GetGroupsResponseType,
  GetPermissionsResponseType,
  CreateGroupResponseType,
  BaseResponseType
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get permissions
export function useGetPermissionsQuery(
	{
		limit,
		offset,
		search = '',
		date,
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		date?: { start: Date; end: Date };
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetPermissionsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetPermissionsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.PERMISSIONS, { limit, offset, search, date }],
		async () => {
			let url = `${PERMISSIONS_URL}?limit=${limit || ''}&offset=${offset || ''}&search=${search}`;

			if (date) {
				url += `&from=${date.start}&to=${date.end}`;
			}

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetPermissionsResponseType>) => response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get permissions.',
					});
			},
			...options,
		}
	);
	return query;
}

// get groups query
export function useGetGroupsQuery(
	{
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		date,
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		date?: { start: Date; end: Date };
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetGroupsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetGroupsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.GROUPS, { limit, offset, search, date }],
		async () => {
			let url = `${GROUPS_URL}?limit=${limit}&offset=${offset}&search=${search}`;

			if (date) {
				url += `&from=${date.start}&to=${date.end}`;
			}

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetGroupsResponseType>) => response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get groups.',
					});
			},
			...options,
		}
	);
	return query;
}

// create group mutation
export function useCreateGroupMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: CreateGroupErrorResponseType;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: GroupType) => void;
	}
) {
	const queryAsset = useQueryClient();

	const mutation = useMutation(
		(data: CreateGroupQueryType) =>
			axiosInstance
				.post(GROUPS_URL, data)
				.then(
					(response: AxiosResponse<CreateGroupResponseType>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryAsset.invalidateQueries([tags.GROUPS]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateGroupErrorResponseType>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete group mutation
export function useDeleteGroupMutation(
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
				.delete(GROUP_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryAsset.invalidateQueries([tags.GROUPS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to remove group',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteGroup = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove Group?',
				color: 'danger',
				message: 'Do you want to remove group?',
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

	return { deleteGroup, ...mutation };
}

// edit group mutation
export function useEditGroupMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: CreateGroupErrorResponseType;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: GroupType) => void;
	}
) {
	const queryAsset = useQueryClient();

	const mutation = useMutation(
		(data: { id: string; form: CreateGroupQueryType }) =>
			axiosInstance
				.put(GROUP_URL(data.id), data.form)
				.then(
					(response: AxiosResponse<CreateGroupResponseType>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryAsset.invalidateQueries([tags.GROUPS]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateGroupErrorResponseType>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

