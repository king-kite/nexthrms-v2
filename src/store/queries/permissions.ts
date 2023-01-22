import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import * as tags from '../tagTypes';
import { GROUPS_URL, PERMISSIONS_URL, DEFAULT_PAGINATION_SIZE } from '../../config';
import {
	GroupType,
  GetGroupsResponseType,
  PermissionType,
  GetPermissionsResponseType
} from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// get groups
export function useGetGroupsQuery(
	{
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		date,
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		date?: { start: Date; end: Date };
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetGroupsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetGroupsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.GROUPS, { limit, offset, search, date }],
		async () => {
			let url = `${GROUPS_URL}?limit=${limit}&offset=${offset}&search=${search}`;

			if (date) {
				url += `&from=${date.start}&to=${date.end}`;
			}

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetGroupsResponseType>) => response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get groups.',
					});
			},
			...options,
		}
	);
	return query;
}

// get groups
export function useGetPermissionsQuery(
	{
		limit,
		offset,
		search = '',
		date,
		onError,
	}: {
		limit?: number;
		offset?: number;
		search?: string;
		date?: { start: Date; end: Date };
		onError?: (error: { status: number; message: string }) => void;
	},
	options?: {
		onSuccess?: (data: GetPermissionsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetPermissionsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.GROUPS, { limit, offset, search, date }],
		async () => {
			let url = `${GROUPS_URL}?limit=${limit || ''}&offset=${offset || ''}&search=${search}`;

			if (date) {
				url += `&from=${date.start}&to=${date.end}`;
			}

			return axiosInstance
				.get(url)
				.then(
					(response: AxiosResponse<GetPermissionsResponseType>) => response.data.data
				);
		},
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get permissions.',
					});
			},
			...options,
		}
	);
	return query;
}
