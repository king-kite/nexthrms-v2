import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import { CLIENT_URL, CLIENTS_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import { useAlertModalContext } from '../../store/contexts';
import {
	BaseResponseType,
	ClientType,
	CreateClientErrorResponseType,
	CreateClientResponseType,
	GetClientsResponseType,
	SuccessResponseType,
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get client
export function useGetClientQuery(
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
		onSuccess?: (data: ClientType) => void;
		onError?: (err: unknown) => void;
		initialData?: () => ClientType;
	}
) {
	const query = useQuery(
		[tags.CLIENTS, { id }],
		() =>
			axiosInstance
				.get(CLIENT_URL(id || ''))
				.then(
					(response: AxiosResponse<SuccessResponseType<ClientType>>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get client.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// get clients
export function useGetClientsQuery(
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
		onSuccess?: (data: GetClientsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetClientsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.CLIENTS, { limit, offset, search }],
		() =>
			axiosInstance
				.get(`${CLIENTS_URL}?limit=${limit}&offset=${offset}&search=${search}`)
				.then(
					(response: AxiosResponse<GetClientsResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get clients.',
					});
			},
			...options,
		}
	);
	return query;
}

// create client mutation
export function useCreateClientMutation(
	options?: {
		onSuccess?: () => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ClientType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: FormData) =>
			axiosInstance
				.post(CLIENTS_URL, data)
				.then(
					(response: AxiosResponse<CreateClientResponseType>) =>
						response.data.data
				),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.CLIENTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete client mutation
export function useDeleteClientMutation(
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
				.delete(CLIENT_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.CLIENTS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete client',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteClient = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Client?',
				color: 'danger',
				message: 'Do you want to delete client?',
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

	return { deleteClient, ...mutation };
}

// edit client mutation
export function useEditClientMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: {
			status: number;
			data?: CreateClientErrorResponseType;
			message: string;
		}) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ClientType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: { id: string; form: FormData }) =>
			axiosInstance
				.put(CLIENT_URL(data.id), data.form)
				.then(
					(response: AxiosResponse<CreateClientResponseType>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.CLIENTS]);
				if (options?.onSuccess) options.onSuccess();
			},
			onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<CreateClientErrorResponseType>(err);
					if (error) options.onError(error);
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}
