import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import * as tags from '../tagTypes';
import { JOB_URL, JOBS_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import {
	BaseResponseType,
	CreateJobResponseType,
	GetJobsResponseType,
	JobType,
} from '../../types';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

// get jobs query
export function useGetJobsQuery(
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
		onSuccess?: (data: { total: number; result: JobType[] }) => void;
		onError?: (err: unknown) => void;
		initialData?: () => { total: number; result: JobType[] };
	}
) {
	const query = useQuery(
		[tags.JOBS, { limit, offset, search }],
		() =>
			axiosInstance(
				JOBS_URL + `?limit=${limit}&offset=${offset}&search=${search}`
			).then(
				(response: AxiosResponse<GetJobsResponseType>) => response.data.data
			),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message: error?.message || 'An error occurred. Unable to get jobs.',
					});
			},
			...options,
		}
	);
	return query;
}

// delete job mutation
export function useDeleteJobMutation(
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
				.delete(JOB_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.JOBS]);

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete job',
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// create job mutation
export function useCreateJobMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: JobType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: { name: string }) =>
			axiosInstance
				.post(JOBS_URL, data)
				.then(
					(response: AxiosResponse<CreateJobResponseType>) => response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.JOBS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}

// edit job mutation
export function useEditJobMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (data: JobType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(params: { id: string; data: { name: string } }) =>
			axiosInstance
				.put(JOB_URL(params.id), params.data)
				.then(
					(response: AxiosResponse<CreateJobResponseType>) => response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.JOBS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}
