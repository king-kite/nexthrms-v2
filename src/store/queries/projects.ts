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
	PROJECT_TASK_URL,
	PROJECT_TASK_FOLLOWERS_URL,
	PROJECT_TASK_FOLLOWER_URL,
	PROJECT_TEAM_URL,
	PROJECT_TEAM_MEMBER_URL,
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
	GetProjectTeamResponseType,
	ProjectType,
	ProjectFileType,
	ProjectTeamType,
	SuccessResponseType,
	CreateProjectTaskErrorResponseType,
	ProjectTaskType,
	CreateProjectTaskQueryType,
} from '../../types';
import axiosInstance from '../../utils/axios/authRedirectInstance';
import axiosFileInstance from '../../utils/axios/fileRedirectInstance';
import { getDate } from '../../utils';
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
		(project: ProjectType) => {
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
						bg: project.completed
							? 'bg-yellow-600 hover:bg-yellow-500'
							: 'bg-green-600 hover:bg-green-500',
						caps: true,
						onClick: () => {
							const data = {
								name: project.name,
								description: project.description,
								priority: project.priority,
								initialCost: project.initialCost,
								rate: project.rate,
								startDate: getDate(project.startDate, false) as Date,
								endDate: getDate(project.endDate, false) as Date,
								client: project.client?.id || '',
								completed: !project.completed,
							};
							showLoader();
							mutate({
								id: project.id,
								data,
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
		async (query: { projectId: string; data: CreateProjectFileQueryType }) => {
			const form = new FormData();
			form.append('file', query.data.file as any);
			form.append('name', query.data.name);

			const response: AxiosResponse<SuccessResponseType<ProjectFileType>> =
				await axiosFileInstance.post(PROJECT_FILES_URL(query.projectId), form);
			return response.data.data;
		},
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
				queryClient.invalidateQueries([tags.PROJECT_FILES]);
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

// ****** Project Team Queries ******

// get project team
export function useGetProjectTeamQuery(
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
		onSuccess?: (data: GetProjectTeamResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetProjectTeamResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.PROJECT_TEAM, { id }],
		() =>
			axiosInstance
				.get(
					`${PROJECT_TEAM_URL(
						id
					)}?limit=${limit}&offset=${offset}&search=${search}`
				)
				.then(
					(response: AxiosResponse<GetProjectTeamResponseType>) =>
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
							'An error occurred. Unable to get project team.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// appoint project team leader
export function useAppointProjectTeamLeaderMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (
			response: SuccessResponseType<ProjectTeamType>['data']
		) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(query: {
			projectId: string;
			id: string;
			data: {
				employeeId: string;
				isLeader: boolean;
			};
		}) =>
			axiosInstance
				.put(PROJECT_TEAM_MEMBER_URL(query.projectId, query.id), query.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectTeamType>>) =>
						response.data.data
				),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.PROJECT_TEAM]);
				queryClient.invalidateQueries([
					tags.PROJECTS,
					{ id: variables.projectId },
				]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to update team member.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const appointMember = React.useCallback(
		({
			decision,
			...query
		}: {
			decision: 'appoint' | 'remove';
			projectId: string;
			id: string;
			data: {
				employeeId: string;
				isLeader: boolean;
			};
		}) => {
			openModal({
				closeOnButtonClick: false,
				header:
					decision === 'appoint'
						? 'Appoint Team Leader?'
						: 'Re-Appoint Team Leader?',
				color: 'danger',
				message:
					'Do you want to ' +
					(decision === 'appoint' ? 'appoint' : 're-appoint') +
					' team leader?',
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
							mutate(query);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { appointMember, ...mutation };
}

// delete project team member
export function useDeleteProjectTeamMemberMutation(
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
				.delete(PROJECT_TEAM_MEMBER_URL(query.projectId, query.id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.PROJECT_TEAM]);
				queryClient.invalidateQueries([
					tags.PROJECTS,
					{ id: variables.projectId },
				]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to remove project team member.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteMember = React.useCallback(
		(query: { projectId: string; id: string }) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove Team Member?',
				color: 'danger',
				message: 'Do you want to remove the team member?',
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
							mutate(query);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { deleteMember, ...mutation };
}

// ****** Project Team Queries ******

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
		[tags.PROJECT_TASKS, { id, limit, offset, search }],
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
							'An error occurred. Unable to get project tasks.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// get project tasks
export function useGetProjectTaskQuery(
	{
		projectId,
		id,
		onError,
	}: {
		projectId: string;
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
		onSuccess?: (data: SuccessResponseType<ProjectTaskType>['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => SuccessResponseType<ProjectTaskType>['data'];
	}
) {
	const query = useQuery(
		[tags.PROJECT_TASKS, { projectId, id }],
		() =>
			axiosInstance
				.get(PROJECT_TASK_URL(projectId, id))
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectTaskType>>) =>
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
							'An error occurred. Unable to get project task.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// delete project task
export function useDeleteProjectTaskMutation(
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
				.delete(PROJECT_TASK_URL(query.projectId, query.id))
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.PROJECT_TASKS]);
				queryClient.invalidateQueries([
					tags.PROJECTS,
					{ id: variables.projectId },
				]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to delete project task.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteTask = React.useCallback(
		(query: { projectId: string; id: string }) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Delete Project Task?',
				color: 'danger',
				message: 'Do you want to delete this project task?',
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
							mutate(query);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { deleteTask, ...mutation };
}

// create project task
export function useCreateProjectTaskMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectTaskErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectTaskType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(query: { projectId: string; data: CreateProjectTaskQueryType }) =>
			axiosInstance
				.post(PROJECT_TASKS_URL(query.projectId), query.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectTaskType>>) =>
						response.data.data
				),
		{
			onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.PROJECT_TASKS]);
				queryClient.invalidateQueries([
					tags.PROJECTS,
					{ id: variables.projectId },
				]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err =
						handleAxiosErrors<CreateProjectTaskErrorResponseType>(error);
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

// edit project task
export function useEditProjectTaskMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectTaskErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectTaskType) => void;
	}
) {
	const queryClient = useQueryClient();

	const mutation = useMutation(
		(query: {
			projectId: string;
			id: string;
			data: CreateProjectTaskQueryType;
		}) =>
			axiosInstance
				.put(PROJECT_TASK_URL(query.projectId, query.id), query.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectTaskType>>) =>
						response.data.data
				),
		{
			onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.PROJECT_TASKS]);
				queryClient.invalidateQueries([
					tags.PROJECTS,
					{ id: variables.projectId },
				]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err =
						handleAxiosErrors<CreateProjectTaskErrorResponseType>(error);
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

// mark task completed
export function useMarkProjectTaskMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (
			e: CreateProjectTaskErrorResponseType & { message?: string }
		) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (response: ProjectTaskType) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(query: {
			projectId: string;
			id: string;
			data: CreateProjectTaskQueryType;
		}) =>
			axiosInstance
				.put(PROJECT_TASK_URL(query.projectId, query.id), query.data)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectTaskType>>) =>
						response.data.data
				),
		{
			onSuccess(data, variables) {
				queryClient.invalidateQueries([tags.PROJECT_TASKS]);
				queryClient.invalidateQueries([
					tags.PROJECTS,
					{ id: variables.projectId },
				]);

				if (options?.onSuccess) options.onSuccess();
			},
			onError(error) {
				if (options?.onError) {
					const err =
						handleAxiosErrors<CreateProjectTaskErrorResponseType>(error);
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

	const markTask = React.useCallback(
		(task: ProjectTaskType) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Mark ' + (!task.completed ? 'Completed?' : 'Ongoing?'),
				color: task.completed ? 'warning' : 'success',
				message:
					'Do you want to mark this task as ' +
					(!task.completed ? 'completed?' : 'ongoing?'),
				decisions: [
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						caps: true,
						onClick: close,
						title: 'cancel',
					},
					{
						bg: task.completed
							? 'bg-yellow-600 hover:bg-yellow-500'
							: 'bg-green-600 hover:bg-green-500',
						caps: true,
						onClick: () => {
							showLoader();
							const data = {
								name: task.name,
								description: task.description,
								dueDate: getDate(task.dueDate, false) as Date,
								priority: task.priority,
								completed: !task.completed,
							};
							mutate({
								id: task.id,
								projectId: task.project.id,
								data,
							});
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { markTask, ...mutation };
}

// ****** Project Task Queries ******

// ****** Project Task Followers ******

// get Task followers
export function useGetProjectTaskFollowersQuery(
	{
		projectId,
		id,
		limit = DEFAULT_PAGINATION_SIZE,
		offset = 0,
		search = '',
		onError,
	}: {
		projectId: string;
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
		onSuccess?: (data: GetProjectTeamResponseType['data']) => void;
		onError?: (err: unknown) => void;
		initialData?: () => GetProjectTeamResponseType['data'];
	}
) {
	const query = useQuery(
		[tags.PROJECT_TASKS_FOLLOWERS, { projectId, id }],
		() =>
			axiosInstance
				.get(
					`${PROJECT_TASK_FOLLOWERS_URL(
						projectId,
						id
					)}?limit=${limit}&offset=${offset}&search=${search}`
				)
				.then(
					(response: AxiosResponse<GetProjectTeamResponseType>) =>
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
							'An error occurred. Unable to get project task followers.',
					});
			},
			enabled: !!id,
			...options,
		}
	);
	return query;
}

// appoint project task leader
export function useAppointProjectTaskLeaderMutation(
	options?: {
		onSuccess?: () => void;
		onError?: (error: { message: string }) => void;
	},
	queryOptions?: {
		onError?: (e: unknown) => void;
		onMutate?: () => void;
		onSettled?: () => void;
		onSuccess?: (
			response: SuccessResponseType<ProjectTeamType>['data']
		) => void;
	}
) {
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const queryClient = useQueryClient();

	const { mutate, ...mutation } = useMutation(
		(query: {
			projectId: string;
			taskId: string;
			id: string;
			data: {
				memberId: string;
				isLeader: boolean;
			};
		}) =>
			axiosInstance
				.put(
					PROJECT_TASK_FOLLOWER_URL(query.projectId, query.taskId, query.id),
					query.data
				)
				.then(
					(response: AxiosResponse<SuccessResponseType<ProjectTeamType>>) =>
						response.data.data
				),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([
					tags.PROJECT_TASKS_FOLLOWERS,
					{ projectId: variables.projectId, id: variables.taskId },
				]);
				queryClient.invalidateQueries([
					tags.PROJECT_TASKS,
					{ projectId: variables.projectId, id: variables.taskId },
				]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to update task follower.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const appointFollower = React.useCallback(
		({
			decision,
			...query
		}: {
			decision: 'appoint' | 'remove';
			projectId: string;
			taskId: string;
			id: string;
			data: {
				memberId: string;
				isLeader: boolean;
			};
		}) => {
			openModal({
				closeOnButtonClick: false,
				header:
					decision === 'appoint'
						? 'Appoint Task Leader?'
						: 'Re-Appoint Task Leader?',
				color: decision === 'appoint' ? 'success' : 'danger',
				message:
					'Do you want to ' +
					(decision === 'appoint' ? 'appoint' : 're-appoint') +
					' team leader?',
				decisions: [
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						caps: true,
						onClick: close,
						title: 'cancel',
					},
					{
						bg:
							decision === 'appoint'
								? 'bg-green-600 hover:bg-green-500'
								: 'bg-red-600 hover:bg-red-500',
						caps: true,
						onClick: () => {
							showLoader();
							mutate(query);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { appointFollower, ...mutation };
}

// delete project task follower
export function useDeleteProjectTaskFollowerMutation(
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
		(query: { projectId: string; taskId: string; id: string }) =>
			axiosInstance
				.delete(
					PROJECT_TASK_FOLLOWER_URL(query.projectId, query.taskId, query.id)
				)
				.then((response: AxiosResponse<BaseResponseType>) => response.data),
		{
			async onSuccess(data, variables) {
				queryClient.invalidateQueries([
					tags.PROJECT_TASKS_FOLLOWERS,
					{
						taskId: variables.taskId,
						projectId: variables.projectId,
					},
				]);
				queryClient.invalidateQueries([
					tags.PROJECT_TASKS,
					{ projectId: variables.projectId, id: variables.taskId },
				]);
				if (options?.onSuccess) options.onSuccess();
			},
			async onError(err) {
				if (options?.onError) {
					const error = handleAxiosErrors(err);
					options.onError({
						message:
							error?.message ||
							'An error occurred. Unable to remove task follower.',
					});
				}
			},
			async onSettled() {
				close();
			},
			...queryOptions,
		}
	);

	const deleteFollower = React.useCallback(
		(query: { projectId: string; taskId: string; id: string }) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove Task Follower?',
				color: 'danger',
				message: 'Do you want to remove this task follower?',
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
							mutate(query);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	return { deleteFollower, ...mutation };
}

// ****** Project Task Followers ******
