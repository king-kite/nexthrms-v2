import * as routes from '../../../config/server';
import * as tags from '../../tags';
import { getExportResponse, getImportResponse } from '../../responses';

import project from './project';
import projects from './projects';

import projectFile from './project-file';
import projectFiles from './project-files';

import projectTeam from './project-team';
import projectTeamMember from './project-team-member';

import projectTask from './project-task';
import projectTasks from './project-tasks';

import projectTaskFollower from './project-task-follower';
import projectTaskFollowers from './project-task-followers';

const paths = {
	[routes.PROJECTS_URL]: projects,
	[routes.PROJECT_URL('{id}')]: project,
	[routes.PROJECTS_EXPORT_URL]: getExportResponse({
		title: 'Export Projects Data',
		tags: [tags.Projects],
	}),
	[routes.PROJECTS_IMPORT_URL]: getImportResponse({
		parameters: [
			{
				in: 'query',
				name: 'import',
				required: false,
				description:
					"Set to 'files' import files for all projects. Set to 'team' to import team for all projects. Set to 'tasks' to import tasks for all projetcs. Set to 'followers' to import followers data for all tasks. Otherwise leave empty.",
				schema: {
					type: 'projects | files | team | tasks | followers',
				},
			},
		],
		title: 'Import Projects Data',
		tags: [tags.Projects],
	}),

	[routes.PROJECT_FILES_URL('{projectId}')]: projectFiles,
	[routes.PROJECT_FILE_URL('{projectId}', '{projectFileId}')]: projectFile,
	[routes.PROJECT_FILES_EXPORT_URL('{projectId}')]: getExportResponse({
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
				},
			},
		],
		title: 'Export Project Files Data',
		tags: [tags.Projects],
	}),
	[routes.PROJECT_FILES_IMPORT_URL('{projectId}')]: getImportResponse({
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
				},
			},
		],
		title: 'Import Project Files Data',
		tags: [tags.Projects],
	}),

	[routes.PROJECT_TEAM_URL('{projectId}')]: projectTeam,
	[routes.PROJECT_TEAM_MEMBER_URL('{projectId}', '{memberId}')]:
		projectTeamMember,
	[routes.PROJECT_TEAM_EXPORT_URL('{projectId}')]: getExportResponse({
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
				},
			},
		],
		title: 'Export Project Team Data',
		tags: [tags.Projects],
	}),
	[routes.PROJECT_TEAM_IMPORT_URL('{projectId}')]: getImportResponse({
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
				},
			},
		],
		title: 'Import Project Team Data',
		tags: [tags.Projects],
	}),

	[routes.PROJECT_TASKS_URL('{projectId}')]: projectTasks,
	[routes.PROJECT_TASK_URL('{projectId}', '{taskId}')]: projectTask,
	[routes.PROJECT_TASKS_EXPORTS_URL('{projectId}')]: getExportResponse({
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
				},
			},
		],
		title: 'Export Single Project Tasks Data',
		tags: [tags.Projects],
	}),
	[routes.PROJECT_TASKS_IMPORT_URL('{projectId}')]: getImportResponse({
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
				},
			},
			{
				in: 'query',
				name: 'import',
				required: false,
				description:
					"Set to 'followers' to import followers data for all tasks. Otherwise leave empty.",
				schema: {
					type: 'tasks | followers',
				},
			},
		],
		title: 'Import Single Project Tasks Data',
		tags: [tags.Projects],
	}),

	[routes.PROJECT_TASK_FOLLOWERS_URL('{projectId}', '{taskId}')]:
		projectTaskFollowers,
	[routes.PROJECT_TASK_FOLLOWER_URL('{projectId}', '{taskId}', '{followerId}')]:
		projectTaskFollower,
	[routes.PROJECT_TASK_FOLLOWERS_EXPORT_URL('{projectId}', '{taskId}')]:
		getExportResponse({
			parameters: [
				{
					in: 'path',
					name: 'projectId',
					required: true,
					schema: {
						type: 'string',
					},
				},
				{
					in: 'path',
					name: 'taskId',
					required: true,
					schema: {
						type: 'string',
					},
				},
			],
			title: 'Export Single Project Task Followers Data',
			tags: [tags.Projects],
		}),
	[routes.PROJECT_TASK_FOLLOWERS_IMPORT_URL('{projectId}', '{taskId}')]:
		getImportResponse({
			parameters: [
				{
					in: 'path',
					name: 'projectId',
					required: true,
					schema: {
						type: 'string',
					},
				},
				{
					in: 'path',
					name: 'taskId',
					required: true,
					schema: {
						type: 'string',
					},
				},
			],
			title: 'Import Single Project Task Followers Data',
			tags: [tags.Projects],
		}),
};

export default paths;
