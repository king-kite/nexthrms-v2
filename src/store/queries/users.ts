import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import {
	ACTIVATE_USER_URL,
	CHANGE_USER_PASSWORD_URL,
	DEFAULT_PAGINATION_SIZE,
	USER_URL,
	USER_PERMISSIONS_URL,
	USERS_URL,
} from '../../config';
import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import {
	BaseResponseType,
	CreateUserErrorResponseType,
	CreateUserResponseType,
	GetUsersResponseType,
	SuccessResponseType,
	PermissionType,
	UserType,
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// activate or deactivate user mutation
export function useActivateUserMutation(
	options: {
		label?: string;
		onSuccess?: () => void;
		onError?: (err: { status: number; message: string }) => void;
	} = {
		label: 'user',
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSuccess?: (response: BaseResponseType) => void;
	}
) {
	const { open: showAlert } = useAlertContext();
	const {
		open: openModal,
		close: closeModal,
		showLoader,
	} = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(data: { action: 'activate' | 'deactivate'; emails: string[] }) =>
			axiosInstance
				.post(ACTIVATE_USER_URL, data)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries({
					predicate: (query) =>
						Array.isArray(query.queryKey) &&
						[tags.CLIENTS, tags.USERS, tags.USERS].includes(query.queryKey[0]),
				});

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<{
						action?: string;
						emails?: string;
					}>(err);
					if (error) {
						options.onError({
							status: error.status,
							message:
								error.data?.action || error.data?.emails || error.message,
						});
					}
				}
			},
			async onSettled(data, error, variables, contexts) {
				const { action } = variables;
				closeModal();
				if (error)
					showAlert({
						type: 'danger',
						message: 'Failed to ' + action + ' ' + (options.label || 'user'),
					});
			},
			...queryOptions,
		}
	);

	const activate = React.useCallback(
		(emails: string[], action: 'activate' | 'deactivate') => {
			openModal({
				closeOnButtonClick: false,
				color: action === 'deactivate' ? 'danger' : 'success',
				header:
					action === 'deactivate'
						? `Deactivate ${options?.label || ''}`
						: `Activate ${options?.label || ''}`,
				message:
					action === 'deactivate'
						? `Deactivating ${options?.label} will disable all actions on this application.\n Use this instead of deleting ${options.label}.`
						: `Activating ${options?.label} will enable login and use this applications`,
				decisions: [
					{
						color: 'info',
						onClick: closeModal,
						title: 'Cancel',
					},
					{
						onClick: () => {
							mutate({ action, emails });
							showLoader(true);
						},
						color: action === 'deactivate' ? 'danger' : 'success',
						title: 'Proceed',
					},
				],
			});
		},
		[mutate, openModal, closeModal, showLoader, options.label]
	);

	return { activate, ...mutation };
}

// change user's password
export function useChangeUserPasswordMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: {
			status: number;
			message: string;
			data?: {
				password1?: string;
				password2?: string;
			};
		}) => void;
	},
	queryOptions?: {
		onSuccess: () => void;
		onError?: (err: unknown) => void;
	}
) {
	const mutation = useMutation(
		(data: { password1: string; password2: string }) =>
			axiosInstance
				.post(CHANGE_USER_PASSWORD_URL, data)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(error) {
				if (options?.onError) {
					const err = handleAxiosErrors<{
						password1?: string;
						password2?: string;
					}>(error);
					if (err) {
						options.onError(err);
					}
				}
			},
			...queryOptions,
		}
	);
	return mutation;
}

// get users query
export function useGetUsersQuery(
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
		enabled?: boolean;
		onSuccess?: (data: GetUsersResponseType) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetUsersResponseType;
	}
) {
	const query = useQuery(
		[tags.USERS, { limit, offset, search }],
		() =>
			axiosInstance(
				USERS_URL + `?limit=${limit}&offset=${offset}&search=${search}`
			).then(
				(response: AxiosResponse<GetUsersResponseType>) => response.data.data
			),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get users.',
					});
			},
			...options,
		}
	);
	return query;
}

// get user
export function useGetUserQuery(
	{
		id,
		onError,
	}: {
		id?: string;
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
		onSuccess?: (data: UserType) => void;
		onError?: (err: unknown) => void;
		initialData?: () => UserType;
	}
) {
	const query = useQuery(
		[tags.USERS, { id }],
		() =>
			axiosInstance
				.get(USER_URL(id || ''))
				.then(
					(response: AxiosResponse<SuccessResponseType<UserType>>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message: error?.message || 'An error occurred. Unable to get user.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// create user mutation
export function useCreateUserMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: {
			status: number;
			data?: CreateUserErrorResponseType | undefined;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: UserType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: FormData) =>
			axiosInstance
				.post(USERS_URL, data)
				.then(
					(response: AxiosResponse<CreateUserResponseType>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.USERS]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					if (options?.onError) {
						const error = handleAxiosErrors<CreateUserErrorResponseType>(err);
						if (error) options.onError(error);
					}
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete user mutation
export function useDeleteUserMutation(
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
				.delete(USER_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.USERS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete user',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteUser = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete User?',
				color: 'warning',
				message: 'Do you want to delete user?',
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

	return { deleteUser, ...mutation };
}

// edit user mutation
export function useEditUserMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: CreateUserErrorResponseType;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: UserType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: { id: string; form: FormData }) =>
			axiosInstance
				.put(USER_URL(data.id), data.form)
				.then(
					(response: AxiosResponse<CreateUserResponseType>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.USERS]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateUserErrorResponseType>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// get user permissions query
export function useGetUserPermissionsQuery(
	{
		id,
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		onError,
	}: {
		id: string;
		limit?: number;
		offset?: number;
		search?: string;
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		enabled?: boolean;
		onSuccess?: (
			data: SuccessResponseType<{
				total: number;
				result: PermissionType[];
			}>['data']
		) => void;
		onError?: (err: unknown) => void;
		initialData?: () => SuccessResponseType<{
			total: number;
			result: PermissionType[];
		}>['data'];
	}
) {
	const query = useQuery(
		[tags.USER_PERMISSIONS, { id, limit, offset, search }],
		() =>
			axiosInstance(
				USER_PERMISSIONS_URL(id) +
					`?limit=${limit}&offset=${offset}&search=${search}`
			).then(
				(
					response: AxiosResponse<
						SuccessResponseType<{
							total: number;
							result: PermissionType[];
						}>
					>
				) => response.data.data
			),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message ||
							'An error occurred. Unable to get user permissions.',
					});
			},
			...options,
		}
	);
	return query;
}

// edit user permissions mutation
export function useEditUserPermissionsMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: {
				permissions?: string;
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
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: {
			id: string;
			form: {
				permissions: string[];
			};
		}) =>
			axiosInstance
				.put(USER_PERMISSIONS_URL(data.id), data.form)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.USER_PERMISSIONS]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<{
						permissions?: string;
					}>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}
