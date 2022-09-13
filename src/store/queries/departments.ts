import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import * as tags from '../tagTypes';
import {
	DEPARTMENT_URL,
	DEPARTMENTS_URL,
	DEFAULT_PAGINATION_SIZE,
} from '../../config';
import {
	BaseResponseType,
	CreateDepartmentResponseType,
	GetDepartmentsResponseType,
	DepartmentType,
} from '../../types';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

// get departments query
export function useGetDepartmentsQuery(
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
		onSuccess?: (data: { total: number; result: DepartmentType[] }) => void;
		onError?: (err: unknown) => void;
		initialData?: () => { total: number; result: DepartmentType[] };
	}
) {
	const query = useQuery(
		[tags.DEPARTMENTS, { limit, offset, search }],
		() =>
			axiosInstance(
				DEPARTMENTS_URL + `?limit=${limit}&offset=${offset}&search=${search}`
			).then(
				(response: AxiosResponse<GetDepartmentsResponseType>) =>
					response.data.data
			),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get departments.',
					});
			},
			...options,
		}
	);
	return query;
}

// create department mutation
export function useCreateDepartmentMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: DepartmentType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: { name: string; hod: string | null }) =>
			axiosInstance
				.post(DEPARTMENTS_URL, data)
				.then(
					(response: AxiosResponse<CreateDepartmentResponseType>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.DEPARTMENTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete department mutation
export function useDeleteDepartmentMutation(
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
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(id: string) =>
			axiosInstance
				.delete(DEPARTMENT_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.DEPARTMENTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to delete department',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete departments mutation
export function useDeleteDepartmentsMutation(
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
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: string[]) =>
			axiosInstance({
				url: DEPARTMENTS_URL,
				method: 'DELETE',
				data: { values: data },
			}).then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.DEPARTMENTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to delete department',
					});
				}
			},
			...queryOptions,
		}
	);
	return mutation;
}

// edit department mutation
export function useEditDepartmentMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: DepartmentType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(params: { id: string; data: { name: string; hod: string | null } }) =>
			axiosInstance
				.put(DEPARTMENT_URL(params.id), params.data)
				.then(
					(response: AxiosResponse<CreateDepartmentResponseType>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.DEPARTMENTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}
