import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import { useAlertModalContext } from '../contexts';
import * as tags from '../tagTypes';
import {
	DEFAULT_PAGINATION_SIZE,
	OVERTIME_ADMIN_URL,
	OVERTIME_URL,
	OVERTIME_DETAIL_URL,
	OVERTIME_ADMIN_DETAIL_URL,
} from '../../config';
import {
	BaseResponseType,
	GetAllOvertimeResponseType,
	CreateOvertimeQueryType,
	CreateOvertimeErrorResponseType,
	SuccessResponseType,
	OvertimeType,
} from '../../types';
import axiosInstance from '../../utils/axios/authRedirectInstance';
import { handleAxiosErrors } from '../../validators';

// get overtime
export function useGetOvertimeQuery(
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
		onSuccess?: (data: SuccessResponseType<OvertimeType>['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => SuccessResponseType<OvertimeType>['data'];
	}
) {
	const query = useQuery(
		admin ? [tags.OVERTIME_ADMIN, { id }] : [tags.OVERTIME, { id }],
		() =>
			axiosInstance
				.get(admin ? OVERTIME_ADMIN_DETAIL_URL(id) : OVERTIME_DETAIL_URL(id))
				.then(
					(response: AxiosResponse<SuccessResponseType<OvertimeType>>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get overtime.',
					});
			},
			...options,
		}
	);
	return query;
}

// get all overtime
export function useGetAllOvertimeQuery(
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
		onSuccess?: (data: GetAllOvertimeResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetAllOvertimeResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.OVERTIME, { limit, offset, search, from, to }],
		async function () {
			let url = `${OVERTIME_URL}?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) {
				url += `&from=${from}&to=${to}`;
			}
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetAllOvertimeResponseType>) =>
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
							'An error occurred. Unable to get all overtime data.',
					});
			},
			...options,
		}
	);
	return query;
}

// request overtime
export function useRequestOvertimeMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: CreateOvertimeErrorResponseType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: OvertimeType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: CreateOvertimeQueryType) =>
			axiosInstance
				.post(OVERTIME_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<OvertimeType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.OVERTIME]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateOvertimeErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message ||
							'An error occurred. Unable to request overtime!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// request overtime update
export function useRequestOvertimeUpdateMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: CreateOvertimeErrorResponseType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: OvertimeType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(query: { id: string; admin?: boolean; data: CreateOvertimeQueryType }) =>
			axiosInstance
				.put(
					query.admin
						? OVERTIME_ADMIN_DETAIL_URL(query.id)
						: OVERTIME_DETAIL_URL(query.id),
					query.data
				)
				.then(
					(response: AxiosResponse<SuccessResponseType<OvertimeType>>) =>
						response.data.data
				),
		{
			async onSuccess(data, variables) {
				if (!variables.admin) queryClient.invalidateQueries([tags.OVERTIME]);
				else queryClient.invalidateQueries([tags.OVERTIME_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateOvertimeErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message ||
							'An error occurred. Unable to request overtime update!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete overtime
export function useDeleteOvertimeMutation(
	options?: {
		admin?: boolean;
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
				.delete(
					options?.admin
						? OVERTIME_ADMIN_DETAIL_URL(id)
						: OVERTIME_DETAIL_URL(id)
				)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.OVERTIME]);
				queryClient.invalidateQueries([tags.OVERTIME_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateOvertimeErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message || 'An error occurred. Unable to delete overtime!',
					});
				}
			},
			onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteOvertime = React.useCallback(
		(id: string) => {
			open({
				closeOnButtonClick: false,
				header: 'Delete Overtime Request?',
				color: 'danger',
				message: 'Do you want to delete this request for an overtime?',
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

	return { deleteOvertime, ...mutation };
}

// ****** Admin URLs Start ******

// get all overtime
export function useGetAllOvertimeAdminQuery(
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
		onSuccess?: (data: GetAllOvertimeResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetAllOvertimeResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.OVERTIME_ADMIN, { limit, offset, search, from, to }],
		async function () {
			let url = `${OVERTIME_ADMIN_URL}?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) {
				url += `&from=${from}&to=${to}`;
			}
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetAllOvertimeResponseType>) =>
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
							'An error occurred. Unable to get all overtime data.',
					});
			},
			...options,
		}
	);
	return query;
}

// create overtime
export function useCreateOvertimeMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: CreateOvertimeErrorResponseType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: OvertimeType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: CreateOvertimeQueryType) =>
			axiosInstance
				.post(OVERTIME_ADMIN_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<OvertimeType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.OVERTIME_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateOvertimeErrorResponseType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message || 'An error occurred. Unable to create overtime!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// approve overtime
export function useApproveOvertimeMutation(
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
				.post(OVERTIME_ADMIN_DETAIL_URL(query.id), { approval: query.approval })
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.OVERTIME]);
				queryClient.invalidateQueries([tags.OVERTIME_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
				if (options?.onRequestComplete) {
					options.onRequestComplete({
						message: 'Request for overtime was ' + variables.approval,
					});
				}
			},
			async onError(err) {
				const error = handleAxiosErrors(err);
				if (options?.onError) {
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to approve/denied overtime!',
					});
				}
				if (options?.onRequestComplete) {
					options.onRequestComplete({
						message: 'An error occurred. Unable to approve/denied overtime!',
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
