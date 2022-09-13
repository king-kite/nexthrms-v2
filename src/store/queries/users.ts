import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { useCallback } from 'react';

import * as tags from '../tagTypes';
import { ACTIVATE_USER_URL, CHANGE_USER_PASSWORD_URL } from '../../config';
import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import { BaseResponseType } from '../../types';
import { axiosInstance } from '../../utils/axios';
import { handleAxiosErrors } from '../../validators';

// change user's password
export function useChangeUserPasswordMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (err: {
			status: number;
			message: string;
			data?: {
				password1?: string;
				password2?: string;
			};
		}) => void;
	},
	queryOptions?: {
		onSuccess: () => void;
		onError?: (err: unknown) => void;
	}
) {
	const mutation = useMutation(
		(data: { password1: string; password2: string }) =>
			axiosInstance
				.post(CHANGE_USER_PASSWORD_URL, data)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(error) {
				if (options?.onError) {
					const err = handleAxiosErrors<{
						password1?: string;
						password2?: string;
					}>(error);
					if (err) {
						options.onError(err);
					}
				}
			},
			...queryOptions,
		}
	);
	return mutation;
}

// activate or deactivate user mutation
export function useActivateUserMutation(
	options: {
		label?: string;
		onSuccess?: () => void;
		onError?: (err: { status: number; message: string }) => void;
	} = {
		label: 'user',
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSuccess?: (response: BaseResponseType) => void;
	}
) {
	const { open: showAlert } = useAlertContext();
	const {
		open: openModal,
		close: closeModal,
		showLoader,
	} = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(data: { action: 'activate' | 'deactivate'; emails: string[] }) =>
			axiosInstance
				.post(ACTIVATE_USER_URL, data)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries({
					predicate: (query) =>
						Array.isArray(query.queryKey) &&
						[tags.CLIENTS, tags.EMPLOYEES, tags.USERS].includes(
							query.queryKey[0]
						),
				});

				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors<{
						action?: string;
						emails?: string;
					}>(err);
					if (error) {
						options.onError({
							status: error.status,
							message:
								error.data?.action || error.data?.emails || error.message,
						});
					}
				}
			},
			async onSettled(data, error, variables, contexts) {
				const { action } = variables;
				closeModal();
				if (error)
					showAlert({
						type: 'danger',
						message: 'Failed to ' + action + ' ' + (options.label || 'user'),
					});
			},
			...queryOptions,
		}
	);

	const activate = useCallback(
		(emails: string[], action: 'activate' | 'deactivate') => {
			openModal({
				closeOnButtonClick: false,
				color: action === 'deactivate' ? 'danger' : 'success',
				header:
					action === 'deactivate'
						? `Deactivate ${options?.label || ''}`
						: `Activate ${options?.label || ''}`,
				message:
					action === 'deactivate'
						? `Deactivating ${options?.label} will disable all actions on this application.\n Use this instead of deleting ${options.label}.`
						: `Activating ${options?.label} will enable login and use this applications`,
				decisions: [
					{
						color: 'info',
						onClick: closeModal,
						title: 'Cancel',
					},
					{
						onClick: () => {
							mutate({ action, emails });
							showLoader(true);
						},
						color: action === 'deactivate' ? 'danger' : 'success',
						title: 'Proceed',
					},
				],
			});
		},
		[mutate, openModal, closeModal, showLoader, options.label]
	);

	return { activate, ...mutation };
}
