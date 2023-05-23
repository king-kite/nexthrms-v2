import {
	addObjectPermissions,
	importPermissions,
	updateObjectPermissions,
} from './permission';
import prisma from '../client';
import { getProjectTeam } from '../queries';
import {
	ObjectPermissionImportType,
	ProjectFileImportQueryType,
	ProjectTaskFollowerImportQueryType,
	ProjectTeamImportQueryType,
} from '../../types';

// ******* Project Files Start *********
function getProjectFileInput(data: ProjectFileImportQueryType) {
	const keys = data.storage_info_keys
		? data.storage_info_keys.split(',')
		: null;
	const values = data.storage_info_values
		? data.storage_info_values.split(',')
		: null;
	const storageInfo =
		keys && values
			? keys.reduce((acc: any, key: string, index) => {
					return {
						...acc,
						[key]: values[index],
					};
			  }, {})
			: null;

	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		projectId: data.project_id,
		name: data.name,
		file: data.file,
		size: +data.size,
		type: data.type,
		storageInfo,
		uploadedBy: data.uploaded_by ? data.uploaded_by : null,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

export function importProjectFiles({
	data,
	permissions: perms,
	projectId,
	userId,
}: {
	data: ProjectFileImportQueryType[];
	permissions?: ObjectPermissionImportType[];
	projectId: string;
	userId: string;
}) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getProjectFileInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.projectFile.upsert({
						where: { id: data.id },
						update: {
							...data,
							projectId,
						},
						create: {
							...data,
							projectId,
						},
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'projects_files',
						objectId: data.id,
						users: [userId],
					})
				)
			);
			if (perms) await importPermissions(perms);
			else {
				const team = await getProjectTeam({
					id: projectId,
				});
				const ids = team.result.reduce((acc: string[], team) => {
					if (team.employee.user.id !== userId)
						return [...acc, team.employee.user.id];
					return acc;
				}, []);
				await Promise.all(
					result.map((data) =>
						updateObjectPermissions({
							model: 'projects_files',
							objectId: data.id,
							permissions: ['VIEW'],
							users: ids,
						})
					)
				);
			}
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}
// ********* Project Files Stop ********

// ********* Project Team Start **********
function getProjectTeamInput(data: ProjectTeamImportQueryType) {
	return {
		id: data.id ? data.id : undefined,
		isLeader: data.is_leader
			? data.is_leader.toString().toLowerCase() === 'true'
			: false,
		employeeId: data.employee_id,
		projectId: data.project_id,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

export function importProjectTeam({
	data,
	projectId,
}: {
	data: ProjectTeamImportQueryType[];
	projectId?: string;
}) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getProjectTeamInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.projectTeam.upsert({
						where: {
							projectId_employeeId: {
								projectId: projectId || data.projectId,
								employeeId: data.employeeId,
							},
						},
						update: {
							...data,
							projectId: projectId || data.projectId,
						},
						create: {
							...data,
							projectId: projectId || data.projectId,
						},
					})
				)
			);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}
// ********* Project Team Stop **********

// ********* Project Task Follower Start ********

function getTaskFollowerInput(data: ProjectTaskFollowerImportQueryType) {
	return {
		id: data.id ? data.id : undefined,
		isLeader: data.is_leader
			? data.is_leader.toString().toLowerCase() === 'true'
			: false,
		memberId: data.member_id,
		taskId: data.task_id,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

export function importProjectTaskFollowers({
	data,
	taskId,
}: {
	data: ProjectTaskFollowerImportQueryType[];
	taskId?: string;
}) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getTaskFollowerInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.projectTaskFollower.upsert({
						where: {
							taskId_memberId: {
								taskId: taskId || data.taskId,
								memberId: data.memberId,
							},
						},
						update: {
							...data,
							taskId: taskId || data.taskId,
						},
						create: {
							...data,
							taskId: taskId || data.taskId,
						},
					})
				)
			);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

// ********* Project Task Follower Stop ********
