import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import {
	GROUPS_URL,
	PERMISSIONS_URL,
	DEFAULT_PAGINATION_SIZE,
	GROUP_URL,
	OBJECT_PERMISSIONS_URL,
} from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
	CreateGroupQueryType,
	CreateGroupErrorResponseType,
	GroupType,
	GetGroupsResponseType,
	GetPermissionsResponseType,
	GetObjectPermissionsResponseType,
	CreateGroupResponseType,
	SuccessResponseType,
	BaseResponseType,
	PermissionModelNameType,
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get object permissions
export function useGetObjectPermissionsQuery(
	{
		modelName,
		objectId,
		permission = '',
		onError,
		groups,
		users,
	}: {
		modelName: PermissionModelNameType;
		objectId: string;
		permission?: 'CREATE' | 'DELETE' | 'EDIT' | 'VIEW' | '';
		onError?: (error: { status: number; message: string }) => void;
		groups?: {
			limit: number;
			offset: number;
			search: string;
		};
		users?: {
			limit: number;
			offset: number;
			search: string;
		};
	},
	options?: {
		onSuccess?: (data: GetObjectPermissionsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetObjectPermissionsResponseType['data'];
	}
) {
	const query = useQuery(
		[
			tags.PERMISSIONS_OBJECT,
			{ modelName, objectId, permission, groups, users },
		],
		async () => {
			const url = OBJECT_PERMISSIONS_URL(
				modelName,
				objectId,
				permission,
				groups,
				users
			);

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetObjectPermissionsResponseType>) =>
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
							error?.message ||
							'An error occurred. Unable to getting this record permissions.',
					});
			},
			...options,
		}
	);
	return query;
}

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
			let url = `${PERMISSIONS_URL}?limit=${limit || ''}&offset=${
				offset || ''
			}&search=${search}`;

			if (date) {
				url += `&from=${date.start}&to=${date.end}`;
			}

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetPermissionsResponseType>) =>
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
		users = {
			limit: DEFAULT_PAGINATION_SIZE,
			offset: 0,
			search: '',
		},
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		date?: { start: Date; end: Date };
		onError?: (error: { status: number; message: string }) => void;
		users?: {
			limit?: number;
			offset?: number;
			search?: string;
			date?: { start: Date; end: Date };
		};
	},
	options?: {
		onSuccess?: (data: GetGroupsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetGroupsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.GROUPS, { limit, offset, search, date, users }],
		async () => {
			let url = `${GROUPS_URL}?limit=${limit}&offset=${offset}&search=${
				search || ''
			}`;

			if (date) {
				url += `&from=${date.start}&to=${date.end}`;
			}

			if (users) {
				url += `&userLimit=${users?.limit}&userOffset=${users?.offset}&userSearch=${users?.search}`;

				if (users.date) {
					url += `&userFom=${users.date.start}&userTo=${users.date.end}`;
				}
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

// get group
export function useGetGroupQuery(
	{
		id,
		onError,
		users,
	}: {
		id?: string;
		users?: {
			limit?: number;
			offset?: number;
			search?: string;
			date?: { start: Date; end: Date };
		};
		onError?: ({
			status,
			message,
		}: {
			status: number;
			message: string;
		}) => void;
	},
	options?: {
		enabled?: boolean;
		onSuccess?: (data: GroupType) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GroupType;
	}
) {
	const query = useQuery(
		[tags.GROUPS, { id, users }],
		async () => {
			let url = GROUP_URL(id || '');

			if (users) {
				url += `?userLimit=${users?.limit}&userOffset=${
					users?.offset
				}&userSearch=${users?.search || ''}`;

				if (users.date) {
					url += `&userFom=${users.date.start}&userTo=${users.date.end}`;
				}
			}

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<SuccessResponseType<GroupType>>) =>
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
							error?.message || 'An error occurred. Unable to get group.',
					});
			},
			enabled: !!id,
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
