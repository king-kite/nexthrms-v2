import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';

import {
	DEFAULT_PAGINATION_SIZE,
	NOTIFICATIONS_URL,
	NOTIFICATION_URL,
} from '../../config';
import {
	BaseResponseType,
	GetNotificationResponseType,
	NotificationType,
} from '../../types';
import * as tags from '../tagTypes';
import axiosInstance from '../../utils/axios/authRedirectInstance';
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

export function useDeleteNotificationMutation(options?: {
	onMutate?: (total: number) => void;
	onError?: (message: string) => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(noteId: string) => axiosInstance.delete(NOTIFICATION_URL(noteId)),
		{
			onMutate: async (noteId) => {
				// cancel any ongoing get notifications query
				await queryClient.cancelQueries([tags.NOTIFICATIONS]);

				// store the prvious noitifications data
				const previousData:
					| { total: number; result: NotificationType[] }
					| undefined = queryClient.getQueryData([tags.NOTIFICATIONS]);

				// update the query data
				queryClient.setQueryData<
					{ total: number; result: NotificationType[] } | undefined
				>([tags.NOTIFICATIONS], (oldQueryData) => {
					if (oldQueryData) {
						const total = oldQueryData.total - 1;
						const result = oldQueryData.result.filter(
							(note) => note.id !== noteId
						);
						if (options?.onMutate)
							options.onMutate(
								result.filter((note) => note.read === false).length
							);
						return { total, result };
					}
					return previousData;
				});
				return { previousData };
			},
			onSettled(noteId, err, variables, context) {
				if (err) {
					if (context)
						queryClient.setQueryData(
							[tags.NOTIFICATIONS],
							context.previousData
						);
					if (options?.onError)
						options.onError(
							(err as any).message ||
								'An error occurred. Unable to delete notification.'
						);
				} else queryClient.invalidateQueries([tags.NOTIFICATIONS]);
			},
		}
	);

	return mutation;
}

export function useMarkNotificationMutation(options?: {
	onMutate?: (total: number) => void;
	onError?: (message: string) => void;
}) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(noteId: string) =>
			axiosInstance
				.put(NOTIFICATION_URL(noteId), { read: true })
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			onMutate: async (noteId) => {
				// cancel any ongoing get notifications query
				await queryClient.cancelQueries([tags.NOTIFICATIONS]);

				// store the prvious noitifications data
				const previousData:
					| { total: number; result: NotificationType[] }
					| undefined = queryClient.getQueryData([tags.NOTIFICATIONS]);

				// update the query data
				queryClient.setQueryData<
					{ total: number; result: NotificationType[] } | undefined
				>([tags.NOTIFICATIONS], (oldQueryData) => {
					if (oldQueryData) {
						const notification = oldQueryData.result.find(
							(note) => note.id === noteId
						);
						if (!notification) return oldQueryData;

						const result = [...oldQueryData.result];
						const index = result.indexOf(notification);
						result[index] = {
							...notification,
							read: true,
						};
						if (options?.onMutate)
							options.onMutate(
								result.filter((note) => note.read === false).length
							);
						return { total: oldQueryData.total, result };
					}
					return previousData;
				});
				return { previousData };
			},
			onSettled(noteId, err, variables, context) {
				if (err) {
					if (context)
						queryClient.setQueryData(
							[tags.NOTIFICATIONS],
							context.previousData
						);
					if (options?.onError)
						options.onError(
							(err as any).message ||
								'An error occurred. Unable to update notification.'
						);
				} else queryClient.invalidateQueries([tags.NOTIFICATIONS]);
			},
		}
	);

	return mutation;
}
