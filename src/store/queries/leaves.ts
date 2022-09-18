import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import * as tags from '../tagTypes';
import { DEFAULT_PAGINATION_SIZE, LEAVE_URL, LEAVES_URL } from '../../config';
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

// get leaves
export function useGetLeavesQuery(
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
		onSuccess?: (data: GetLeavesResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetLeavesResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.LEAVES, { limit, offset, search }],
		() =>
			axiosInstance
				.get(`${LEAVES_URL}?limit=${limit}&offset=${offset}&search=${search}`)
				.then(
					(response: AxiosResponse<GetLeavesResponseType>) => response.data.data
				),
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
		(query: { id: string; data: CreateLeaveQueryType }) =>
			axiosInstance
				.put(LEAVE_URL(query.id), query.data)
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

	const mutation = useMutation(
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
			...queryOptions,
		}
	);

	return mutation;
}
