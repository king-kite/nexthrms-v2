import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import * as tags from '../tagTypes';
import { MANAGED_FILES_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import { GetManagedFilesResponseType, ManagedFileType } from '../../types';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

// get managed files query
export function useGetManagedFilesQuery(
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
		onSuccess?: (data: { total: number; result: ManagedFileType[] }) => void;
		onError?: (err: unknown) => void;
		initialData?: () => { total: number; result: ManagedFileType[] };
	}
) {
	const query = useQuery(
		[tags.MANAGED_FILES, { limit, offset, search }],
		() => {
			let url =
				MANAGED_FILES_URL + `?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) url += `&from=${from}&to=${to}`;
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetManagedFilesResponseType>) =>
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
							error?.message || 'An error occurred. Unable to get files.',
					});
			},
			...options,
		}
	);
	return query;
}
