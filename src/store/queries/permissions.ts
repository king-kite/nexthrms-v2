import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';
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
	USER_OBJECT_PERMISSIONS_URL,
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
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get user object permissions
export function useGetUserObjectPermissionsQuery(
	{
		modelName,
		objectId,
		permission = '',
		onError,
	}: {
		modelName: PermissionModelChoices;
		objectId: string;
		permission?: PermissionObjectChoices | '';
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (
			data: SuccessResponseType<{
				delete: boolean;
				edit: boolean;
				view: boolean;
			}>['data']
		) => void;
		onError?: (err: unknown) => void;
		initialData?: () => SuccessResponseType<{
			delete: boolean;
			edit: boolean;
			view: boolean;
		}>['data'];
	}
) {
	const query = useQuery(
		[tags.USER_OBJECT_PERMISSIONS, { modelName, objectId, permission }],
		async () => {
			const url = USER_OBJECT_PERMISSIONS_URL(modelName, objectId, permission);

			return axiosInstance.get(url).then(
				(
					response: AxiosResponse<
						SuccessResponseType<{
							delete: boolean;
							edit: boolean;
							view: boolean;
						}>
					>
				) => response.data.data
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
							"An error occurred. Unable to getting this user's record permissions.",
					});
			},
			...options,
		}
	);
	return query;
}

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
		modelName: PermissionModelChoices;
		objectId: string;
		permission?: PermissionObjectChoices | '';
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

// use mutate users/groups from object permission
export function useEditObjectPermissionMutation(
	object: {
		model: PermissionModelChoices;
		id: string;
	},
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: {
				groups?: string;
				users?: string;
			};
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: BaseResponseType) => void;
	}
) {
	const queryAsset = useQueryClient();

	const mutation = useMutation(
		async (
			/** How to write the data
			 * Explain Methods
			 * --------------
			 * 'POST' -> Will override the current users/groups with the provided one i.e. prisma 'set'
			 * 'PUT' -> Will add the provided users/groups to the existing ones i.e. prisma 'connnect'
			 * 'DELETE' -> Will remove the provided users/groups i.e. prisma 'disconnect'
			 *
			 * Explain Permission
			 * ------------------
			 * 'DELETE' -> Will affect only users/groups concerning the DELETE permission
			 * 'EDIT' -> Will affect only users/groups concerning the EDIT permission
			 * 'VIEW' -> Will affect only users/groups concerning the VIEW permission
			 *
			 * Data Example
			 * For example, Removing multiple permissions from a user
			 * at once will look like this. This will remove a user totally from all permissions
			 * associating with the object/record
			 *
			 * data = [
			 * 		{
			 * 			method: 'DELETE',
			 * 			permission: 'DELETE',
			 * 			form: { users: ['3facdgs-4524-24gs-g2g4m4] }
			 * 		},
			 * 		{
			 * 			method: 'DELETE',
			 * 			permission: 'EDIT',
			 * 			form: { users: ['3facdgs-4524-24gs-g2g4m4] }
			 * 		},
			 * 		{
			 * 			method: 'DELETE',
			 * 			permission: 'VIEW',
			 * 			form: { users: ['3facdgs-4524-24gs-g2g4m4] }
			 * 		},
			 * ]
			 */
			data: {
				method: 'POST' | 'PUT' | 'DELETE';
				permission: PermissionObjectChoices;
				form: { users?: string[]; groups?: string[] };
			}[]
		) => {
			const input = data.map(async (info) => {
				const url = OBJECT_PERMISSIONS_URL(
					object.model,
					object.id,
					info.permission
				);

				return axiosInstance({
					url,
					method: info.method,
					data: info.form,
				});
				// .then((response: AxiosResponse<BaseResponseType>) => response.data);
			});

			return Promise.all(input).then(
				(responses: AxiosResponse<BaseResponseType>[]) => responses[0].data
			);
		},
		{
			onSuccess() {
				queryAsset.invalidateQueries([tags.PERMISSIONS_OBJECT]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<{
						groups?: string;
						users?: string;
					}>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
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
		enabled?: boolean;
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
