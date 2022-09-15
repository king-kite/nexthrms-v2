import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

import { useAlertModalContext } from '../contexts';
import * as tags from '../tagTypes';
import {
	DEFAULT_PAGINATION_SIZE,
	PROJECT_URL,
	PROJECTS_URL,
	PROJECT_FILE_URL,
	PROJECT_FILES_URL,
	PROJECT_TASKS_URL,
} from '../../config';
import {
	BaseResponseType,
	CreateProjectQueryType,
	CreateProjectFileQueryType,
	CreateProjectErrorResponseType,
	CreateProjectFileErrorResponseType,
	GetProjectsResponseType,
	GetProjectFilesResponseType,
	GetProjectTasksResponseType,
	ProjectType,
	ProjectFileType,
	SuccessResponseType,
} from '../../types';
import { axiosInstance } from '../../utils';
import { handleAxiosErrors } from '../../validators';

// ****** Project Queires ******

// get project
export function useGetProjectQuery(
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
		onSuccess?: (data: ProjectType) => void;
		onError?: (err: unknown) => void;
		initialData?: () => ProjectType;
	}
) {
	const query = useQuery(
		[tags.PROJECTS, { id }],
		() =>
			axiosInstance
				.get(PROJECT_URL(id || ''))
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectType>>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get project.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// get projects
export function useGetProjectsQuery(
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
		onSuccess?: (data: GetProjectsResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetProjectsResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.PROJECTS, { limit, offset, search }],
		() =>
			axiosInstance
				.get(`${PROJECTS_URL}?limit=${limit}&offset=${offset}&search=${search}`)
				.then(
					(response: AxiosResponse<GetProjectsResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message || 'An error occurred. Unable to get projects.',
					});
			},
			...options,
		}
	);
	return query;
}

// create project
export function useCreateProjectMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(data: CreateProjectQueryType) =>
			axiosInstance
				.post(PROJECTS_URL, data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectType>>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.PROJECTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err = handleAxiosErrors<CreateProjectErrorResponseType>(error);
					options.onError({
						...err?.data,
						message: err?.message || (error as any)?.message,
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// edit project
export function useEditProjectMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(form: { id: string; data: CreateProjectQueryType }) =>
			axiosInstance
				.put(PROJECT_URL(form.id), form.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectType>>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.PROJECTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err = handleAxiosErrors<CreateProjectErrorResponseType>(error);
					options.onError({
						...err?.data,
						message: err?.message || (error as any)?.message,
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete project
export function useDeleteProjectMutation(
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
				.delete(PROJECT_URL(id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.PROJECTS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message || 'An error occurred. Unable to delete project.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteProject = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Project?',
				color: 'danger',
				message: 'Do you want to delete this project?',
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

	return { deleteProject, ...mutation };
}

// mark project completed
export function useMarkProjectMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectType) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(form: { id: string; data: CreateProjectQueryType }) =>
			axiosInstance
				.put(PROJECT_URL(form.id), form.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectType>>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.PROJECTS]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err = handleAxiosErrors<CreateProjectErrorResponseType>(error);
					options.onError({
						...err?.data,
						message: err?.message || (error as any)?.message,
					});
				}
			},
			onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const markProject = React.useCallback(
		({ id, team, updatedAt, ...project }: ProjectType) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Mark ' + (!project.completed ? 'Completed?' : 'Ongoing?'),
				color: project.completed ? 'warning' : 'success',
				message:
					'Do you want to mark this project as ' +
					(!project.completed ? 'completed?' : 'ongoing?'),
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
							mutate({
								id,
								data: {
									...project,
									completed: !project.completed,
									startDate: new Date(project.startDate).toLocaleDateString(
										'en-CA'
									),
									endDate: new Date(project.endDate).toLocaleDateString(
										'en-CA'
									),
									client: project.client?.id || '',
								},
							});
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { markProject, ...mutation };
}

// ****** Project Queries ******

// ****** Project File Queries ******

// get project files
export function useGetProjectFilesQuery(
	{
		id,
		onError,
	}: {
		id: string;
		onError?: ({
			status,
			message,
		}: {
			status: number;
			message: string;
		}) => void;
	},
	options?: {
		onSuccess?: (data: GetProjectFilesResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetProjectFilesResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.PROJECT_FILES, { id }],
		() =>
			axiosInstance
				.get(PROJECT_FILES_URL(id))
				.then(
					(response: AxiosResponse<GetProjectFilesResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message ||
							'An error occurred. Unable to get project files.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// create project file
export function useCreateProjectFileMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectFileErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectFileType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(query: { projectId: string; data: CreateProjectFileQueryType }) =>
			axiosInstance
				.post(PROJECT_FILES_URL(query.projectId), query.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectFileType>>) =>
						response.data.data
				),
		{
			onSuccess() {
				queryClient.invalidateQueries([tags.PROJECT_FILES]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err =
						handleAxiosErrors<CreateProjectFileErrorResponseType>(error);
					options.onError({
						...err?.data,
						message: err?.message || (error as any)?.message,
					});
				}
			},
			...queryOptions,
		}
	);

	return mutation;
}

// delete project file
export function useDeleteProjectFileMutation(
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
		(query: { projectId: string; id: string }) =>
			axiosInstance
				.delete(PROJECT_FILE_URL(query.projectId, query.id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess() {
				queryClient.invalidateQueries([tags.PROJECTS]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to delete project file.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteProjectFile = React.useCallback(
		(projectId: string, id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Project File?',
				color: 'danger',
				message: 'Do you want to delete this project file?',
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
							mutate({ projectId, id });
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { deleteProjectFile, ...mutation };
}

// ****** Project File Queries ******

// ****** Project Task Queries ******

// get project tasks
export function useGetProjectTasksQuery(
	{
		id,
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		onError,
	}: {
		id: string;
		limit?: number;
		offset?: number;
		search?: string;
		onError?: ({
			status,
			message,
		}: {
			status: number;
			message: string;
		}) => void;
	},
	options?: {
		onSuccess?: (data: GetProjectTasksResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetProjectTasksResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.PROJECT_TASKS, { id }],
		() =>
			axiosInstance
				.get(
					`${PROJECT_TASKS_URL(
						id
					)}?limit=${limit}&offset=${offset}&search=${search}`
				)
				.then(
					(response: AxiosResponse<GetProjectTasksResponseType>) =>
						response.data.data
				),
		{
			onError(err) {
				const error = handleAxiosErrors(err);
				if (onError)
					onError({
						status: error?.status || 500,
						message:
							error?.message ||
							'An error occurred. Unable to get project files.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// ****** Project Task Queries ******
