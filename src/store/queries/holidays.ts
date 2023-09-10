import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa';

import { useAlertModalContext } from '../contexts';
import * as tags from '../tagTypes';
import { HOLIDAY_URL, HOLIDAYS_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import {
	ResponseType,
	GetHolidaysResponseType,
	SuccessResponseType,
	HolidayType,
} from '../../types';
import axiosInstance from '../../utils/axios/authRedirectInstance';
import { handleAxiosErrors } from '../../validators';

// get holidays query
export function useGetHolidaysQuery(
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
		onSuccess?: (data: { total: number; result: HolidayType[] }) => void;
		onError?: (err: unknown) => void;
		initialData?: () => { total: number; result: HolidayType[] };
	}
) {
	const query = useQuery(
		[tags.HOLIDAYS, { limit, offset, search }],
		() =>
			axiosInstance(HOLIDAYS_URL + `?limit=${limit}&offset=${offset}&search=${search}`).then(
				(response: AxiosResponse<GetHolidaysResponseType>) => response.data.data
			),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message: error?.message || 'An error occurred. Unable to get holidays.',
					});
			},
			...options,
		}
	);
	return query;
}

// delete holiday mutation
export function useDeleteHolidayMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ResponseType) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(id: string) =>
			axiosInstance
				.delete(HOLIDAY_URL(id))
				.then((response: AxiosResponse<ResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.HOLIDAYS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message: error?.message || 'An error occurred. Unable to delete holiday',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteHoliday = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Holiday?',
				color: 'warning',
				message: 'Do you want to delete holiday?',
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

	return { deleteHoliday, ...mutation };
}

// delete holidays mutation
export function useDeleteHolidaysMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: { message: string }) => void;
	},
	queryOptions?: {
		onSuccess?: (data: ResponseType) => void;
		onError?: (err: unknown) => void;
	}
) {
	const { open: openModal, showLoader, close } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, isLoading, ...mutation } = useMutation(
		(data: { values: string[] }) =>
			axiosInstance({
				url: HOLIDAYS_URL,
				method: 'DELETE',
				data,
			}).then((response: AxiosResponse<ResponseType>) => response.data),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.HOLIDAYS]);
				if (options?.onSuccess) options?.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message: error?.message || 'An error occurred. Unable to delete departments',
					});
				}
			},
			onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteHolidays = React.useCallback(
		(ids: string[]) => {
			if (ids.length > 0) {
				openModal({
					color: 'warning',
					closeOnButtonClick: false,
					decisions: [
						{
							color: 'danger',
							disabled: isLoading,
							onClick: () => {
								showLoader();
								mutate({ values: ids });
							},
							title: 'Confirm',
						},
						{
							color: 'info',
							disabled: isLoading,
							onClick: close,
							title: 'Cancel',
						},
					],
					icon: FaExclamationCircle,
					header: 'Delete selected departments?',
					message: 'Do you want to delete selected departments?.',
				});
			}
		},
		[close, openModal, isLoading, mutate, showLoader]
	);

	return { deleteHolidays, isLoading, ...mutation };
}

// create holiday mutation
export function useCreateHolidayMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: HolidayType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: { name: string }) =>
			axiosInstance
				.post(HOLIDAYS_URL, data)
				.then((response: AxiosResponse<SuccessResponseType<HolidayType>>) => response.data.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.HOLIDAYS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}

// edit holiday mutation
export function useEditHolidayMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (data: HolidayType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(params: { id: string; data: { name: string } }) =>
			axiosInstance
				.put(HOLIDAY_URL(params.id), params.data)
				.then((response: AxiosResponse<SuccessResponseType<HolidayType>>) => response.data.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.HOLIDAYS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}
