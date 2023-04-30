import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import { DEFAULT_PAGINATION_SIZE, NOTIFICATIONS_URL } from '../../config';
import { GetNotificationResponseType } from '../../types';
import * as tags from '../tagTypes';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

export function useGetNotificationsQuery(
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
		onSuccess?: (data: GetNotificationResponseType['data']) => void;
		onError?: (err: unknown) => void;
		refetchInterval?: number;
		initialData?: () => GetNotificationResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.NOTIFICATIONS, { limit, offset, search, from, to }],
		async () => {
			let url = `${NOTIFICATIONS_URL}?limit=${limit}&offset=${offset}&search=${search}`;
			if (from && to) {
				url += `&from=${from}&to=${to}`;
			}
			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetNotificationResponseType>) =>
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
							'An error occurred. Unable to load notifications.',
					});
			},
			...options,
		}
	);
	return query;
}
