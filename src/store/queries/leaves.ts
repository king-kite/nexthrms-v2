import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import { useAlertModalContext } from '../contexts';
import * as tags from '../tagTypes';
import {
	DEFAULT_PAGINATION_SIZE,
	LEAVE_URL,
	LEAVES_URL,
	LEAVES_ADMIN_URL,
	LEAVE_ADMIN_URL,
} from '../../config';
import {
	BaseResponseType,
	GetLeavesResponseType,
	CreateLeaveQueryType,
	CreateLeaveErrorResponseType,
	SuccessResponseType,
	LeaveType,
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get leave
export function useGetLeaveQuery(
	{
		id,
		admin,
		onError,
	}: {
		id: string;
		admin?: boolean;
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: SuccessResponseType<LeaveType>['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => SuccessResponseType<LeaveType>['data'];
	}
) {
	const query = useQuery(
		admin ? [tags.LEAVES_ADMIN, { id }] : [tags.LEAVES, { id }],
		() =>
			axiosInstance
				.get(LEAVE_URL(id))
				.then(
					(response: AxiosResponse<SuccessResponseType<LeaveType>>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get leave.',
					});
			},
			...options,
		}
	);
	return query;
}

// get leaves
export function useGetLeavesQuery(
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
		onSuccess?: (data: GetLeavesResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetLeavesResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.LEAVES, { limit, offset, search, from, to }],
		async () => {
			console.log({ from, to });
			let url = `${LEAVES_URL}?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) {
				url += `&from=${from}&to=${to}`;
			}
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetLeavesResponseType>) => response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get leaves.',
					});
			},
			...options,
		}
	);
	return query;
}

// request leave
export function useRequestLeaveMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: CreateLeaveErrorResponseType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: LeaveType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: CreateLeaveQueryType) =>
			axiosInstance
				.post(LEAVES_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<LeaveType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.LEAVES]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateLeaveErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message || 'An error occurred. Unable to request leave!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// request leave update
export function useRequestLeaveUpdateMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: CreateLeaveErrorResponseType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: LeaveType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(query: { id: string; admin?: boolean; data: CreateLeaveQueryType }) =>
			axiosInstance
				.put(
					query.admin ? LEAVE_ADMIN_URL(query.id) : LEAVE_URL(query.id),
					query.data
				)
				.then(
					(response: AxiosResponse<SuccessResponseType<LeaveType>>) =>
						response.data.data
				),
		{
			async onSuccess(data, variables) {
				if (!variables.admin) queryClient.invalidateQueries([tags.LEAVES]);
				else queryClient.invalidateQueries([tags.LEAVES_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateLeaveErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message ||
							'An error occurred. Unable to request leave update!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete leave
export function useDeleteLeaveMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: () => void;
	}
) {
	const queryClient = useQueryClient();

	const { open, showLoader, close } = useAlertModalContext();

	const { mutate, ...mutation } = useMutation(
		(id: string) =>
			axiosInstance
				.delete(LEAVE_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.LEAVES]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateLeaveErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message || 'An error occurred. Unable to delete leave!',
					});
				}
			},
			onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteLeave = React.useCallback(
		(id: string) => {
			open({
				closeOnButtonClick: false,
				header: 'Delete Leave Request?',
				color: 'danger',
				message: 'Do you want to delete this leave request?',
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
		[open, close, mutate, showLoader]
	);

	return { deleteLeave, ...mutation };
}

// ****** Admin URLs Start ******

// get leaves
export function useGetLeavesAdminQuery(
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
		onSuccess?: (data: GetLeavesResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetLeavesResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.LEAVES_ADMIN, { limit, offset, search, from, to }],
		async function () {
			let url = `${LEAVES_ADMIN_URL}?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) {
				url += `from=${from}&to=${to}`;
			}
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetLeavesResponseType>) => response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get leaves.',
					});
			},
			...options,
		}
	);
	return query;
}

// create leave
export function useCreateLeaveMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: CreateLeaveErrorResponseType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: LeaveType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: CreateLeaveQueryType) =>
			axiosInstance
				.post(LEAVES_ADMIN_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<LeaveType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.LEAVES_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateLeaveErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message || 'An error occurred. Unable to create leave!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// approve leave
export function useApproveLeaveMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: { message?: string }) => void;
		onRequestComplete?: (query: { message: string; error?: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: () => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(query: { id: string; approval: 'APPROVED' | 'DENIED' }) =>
			axiosInstance
				.post(LEAVE_ADMIN_URL(query.id), { approval: query.approval })
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.LEAVES_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
				if (options?.onRequestComplete) {
					options.onRequestComplete({
						message: 'Request for leave was ' + variables.approval,
					});
				}
			},
			async onError(err) {
				const error = handleAxiosErrors(err);
				if (options?.onError) {
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to approve/denied leave!',
					});
				}
				if (options?.onRequestComplete) {
					options.onRequestComplete({
						message: 'An error occurred. Unable to approve/denied leave!',
						error: error?.message,
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// ****** Admin URLs Stop ******
