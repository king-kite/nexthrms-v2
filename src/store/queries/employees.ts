import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import { useAlertModalContext } from '../contexts';
import * as tags from '../tagTypes';
import {
	EMPLOYEE_URL,
	EMPLOYEES_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import {
	BaseResponseType,
	CreateEmployeeErrorResponseType,
	CreateEmployeeResponseType,
	EmployeeType,
	GetEmployeesResponseType,
	SuccessResponseType,
} from '../../types';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

// get employees query
export function useGetEmployeesQuery(
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
		onSuccess?: (data: GetEmployeesResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetEmployeesResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.EMPLOYEES, { limit, offset, search }],
		() =>
			axiosInstance(
				EMPLOYEES_URL + `?limit=${limit}&offset=${offset}&search=${search}`
			).then(
				(response: AxiosResponse<GetEmployeesResponseType>) =>
					response.data.data
			),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get employees.',
					});
			},
			...options,
		}
	);
	return query;
}

// get employee
export function useGetEmployeeQuery(
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
		onSuccess?: (data: EmployeeType) => void;
		onError?: (err: unknown) => void;
		initialData?: () => EmployeeType;
	}
) {
	const query = useQuery(
		[tags.EMPLOYEES, { id }],
		() =>
			axiosInstance
				.get(EMPLOYEE_URL(id || ''))
				.then(
					(response: AxiosResponse<SuccessResponseType<EmployeeType>>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get employees.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// create employee mutation
export function useCreateEmployeeMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: {
			status: number;
			data?: CreateEmployeeErrorResponseType | undefined;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: EmployeeType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: FormData) =>
			axiosInstance
				.post(EMPLOYEES_URL, data)
				.then(
					(response: AxiosResponse<CreateEmployeeResponseType>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.EMPLOYEES]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					if (options?.onError) {
						const error =
							handleAxiosErrors<CreateEmployeeErrorResponseType>(err);
						if (error) options.onError(error);
					}
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete employee mutation
export function useDeleteEmployeeMutation(
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
				.delete(EMPLOYEE_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.EMPLOYEES]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete employee',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteEmployee = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Employee?',
				color: 'danger',
				message: 'Do you want to delete employee?',
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

	return { deleteEmployee, ...mutation };
}

// edit employee mutation
export function useEditEmployeeMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: CreateEmployeeErrorResponseType;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: EmployeeType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: { id: string; form: FormData }) =>
			axiosInstance
				.put(EMPLOYEE_URL(data.id), data.form)
				.then(
					(response: AxiosResponse<CreateEmployeeResponseType>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.EMPLOYEES]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateEmployeeErrorResponseType>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}
