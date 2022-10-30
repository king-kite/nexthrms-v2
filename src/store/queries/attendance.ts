import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import {
	ATTENDANCE_URL,
	ATTENDANCE_ADMIN_URL,
	ATTENDANCE_ADMIN_SINGLE_URL,
	ATTENDANCE_INFO_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
	AttendanceType,
	AttendanceCreateType,
	AttendanceCreateErrorType,
	BaseResponseType,
	GetAttendanceResponseType,
	GetAttendanceInfoResponseType,
	SuccessResponseType,
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get attendance records
export function useGetAttendanceQuery(
	{
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		onError,
	}: {
		limit?: number;
		offset?: number;
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetAttendanceResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetAttendanceResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.ATTENDANCE, { limit, offset }],
		() =>
			axiosInstance
				.get(ATTENDANCE_URL + `?limit=${limit}&offset=${offset}`)
				.then(
					(response: AxiosResponse<GetAttendanceResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message ||
							'An error occurred. Unable to get attendance records.',
					});
			},
			...options,
		}
	);

	return query;
}

// get attendance info
export function useGetAttendanceInfoQuery(
	{
		onError,
	}: {
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetAttendanceInfoResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetAttendanceInfoResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.ATTENDANCE_INFO],
		() =>
			axiosInstance
				.get(ATTENDANCE_INFO_URL)
				.then(
					(response: AxiosResponse<GetAttendanceInfoResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message ||
							'An error occurred. Unable to get attendance statistics.',
					});
			},
			...options,
		}
	);

	return query;
}

// punch in/out
export function usePunchAttendanceMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: AttendanceType) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(action: 'IN' | 'OUT') =>
			axiosInstance
				.post(ATTENDANCE_URL, { action })
				.then(
					(response: AxiosResponse<SuccessResponseType<AttendanceType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.ATTENDANCE_INFO]);
				queryClient.invalidateQueries([tags.ATTENDANCE]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to update your attendance record.',
					});
				}
			},
			async onSettled(data, error, variables) {
				if (variables === 'OUT') close();
			},
			...queryOptions,
		}
	);

	const punchOut = React.useCallback(() => {
		openModal({
			closeOnButtonClick: false,
			header: 'Punch Out?',
			color: 'warning',
			message: 'Do you want to punch out?',
			decisions: [
				{
					bg: 'bg-gray-600 hover:bg-gray-500',
					caps: true,
					onClick: close,
					title: 'No',
				},
				{
					bg: 'bg-yellow-600 hover:bg-yellow-500',
					caps: true,
					onClick: () => {
						showLoader();
						mutate('OUT');
					},
					title: 'Punch Out',
				},
			],
		});
	}, [openModal, close, mutate, showLoader]);

	const handlePunch = React.useCallback(
		(action: 'IN' | 'OUT') => {
			if (action === 'IN') mutate('IN');
			else punchOut();
		},
		[mutate, punchOut]
	);

	return { handlePunch, ...mutation };
}

// get attendance admin records
// get attendance records
export function useGetAttendanceAdminQuery(
	{
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search,
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetAttendanceResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetAttendanceResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.ATTENDANCE_ADMIN, { limit, offset, search }],
		() =>
			axiosInstance
				.get(
					ATTENDANCE_ADMIN_URL +
						`?limit=${limit}&offset=${offset}&search=${search}`
				)
				.then(
					(response: AxiosResponse<GetAttendanceResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message ||
							'An error occurred. Unable to get attendance records.',
					});
			},
			...options,
		}
	);

	return query;
}

// create attendance record
export function useCreateAttendanceMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			err: AttendanceCreateErrorType & {
				message?: string;
			}
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: AttendanceType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: AttendanceCreateType) =>
			axiosInstance
				.post(ATTENDANCE_ADMIN_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<AttendanceType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.ATTENDANCE_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<AttendanceCreateErrorType>(err);
					options.onError({
						...error?.data,
						message:
							error?.message ||
							'An error occurred. Unable to add attendance record!',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete attendance record
export function useDeleteAttendanceMutation(
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
				.delete(ATTENDANCE_ADMIN_SINGLE_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.ATTENDANCE_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to delete attendance record!',
					});
				}
			},
			onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteAttendance = React.useCallback(
		(id: string) => {
			open({
				closeOnButtonClick: false,
				header: 'Delete Attendance Record?',
				color: 'danger',
				message: 'Do you want to delete this attendance record?',
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

	return { deleteAttendance, ...mutation };
}

// update attendance record
export function useEditAttendanceMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (data: AttendanceType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(params: { id: string; data: AttendanceCreateType }) =>
			axiosInstance
				.put(ATTENDANCE_ADMIN_SINGLE_URL(params.id), params.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<AttendanceType>>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.ATTENDANCE_ADMIN]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}
