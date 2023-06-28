import {
	addObjectPermissions,
	importPermissions,
	updateObjectPermissions,
} from './permission';
import prisma from '..';
import { getProjectTeam } from '../queries';
import {
	ObjectPermissionImportType,
	ProjectImportQueryType,
	ProjectFileImportQueryType,
	ProjectTaskImportQueryType,
	ProjectTaskFollowerImportQueryType,
	ProjectTeamImportQueryType,
} from '../../types';

// ******* Project Start *********

function getProjectInput(data: ProjectImportQueryType) {
	return {
		id: data.id ? data.id : undefined,
		clientId: data.client_id ? data.client_id : undefined,
		name: data.name,
		description: data.description,
		completed: data.completed
			? data.completed.toString().toLowerCase() === 'true'
			: false,
		startDate: new Date(data.start_date),
		endDate: new Date(data.end_date),
		initialCost: +data.initial_cost,
		rate: +data.rate,
		priority: data.priority,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

export function importProjects({
	data,
	permissions: perms,
	userId,
}: {
	data: ProjectImportQueryType[];
	permissions?: ObjectPermissionImportType[];
	userId: string;
}) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getProjectInput);
			// check that every project input has an ID.
			const invalid = input.filter((project) => !project.id);
			if (invalid.length > 0) {
				return reject({
					data: {
						message:
							`An id field is required to avoid duplicate records. The following records do not have an id: ` +
							input.map((project) => project.name).join(','),
						title: 'ID field is required.',
					},
					status: 400,
				});
			}
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.project.upsert({
						where: { id: data.id },
						update: data,
						create: data,
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'projects',
						objectId: data.id,
						users: [userId],
					})
				)
			);
			if (perms) await importPermissions(perms);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

// ******* Project Stop **********

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
		project: data.project_id,
		file: data.file_id
			? {
					connect: {
						id: data.file_id,
					},
			  }
			: {
					type: data.type,
					name: data.name,
					url: data.file,
					size: +data.size,
					storageInfo,
			  },
		employee: data.uploaded_by
			? {
					connect: {
						id: data.uploaded_by,
					},
			  }
			: undefined,
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
	projectId?: string;
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
							file: data.file.connect
								? {
										connect: data.file.connect,
								  }
								: {
										update: data.file,
								  },
							project: {
								connect: {
									id: projectId || data.project,
								},
							},
						},
						create: {
							...data,
							file: data.file.connect
								? {
										connect: data.file.connect,
								  }
								: {
										create: data.file,
								  },
							project: {
								connect: {
									id: projectId || data.project,
								},
							},
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
			else if (projectId) {
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

// ********* Project Task Start **********

function getProjectTaskInput(data: ProjectTaskImportQueryType) {
	return {
		projectId: data.project_id,
		id: data.id ? data.id : undefined,
		name: data.name,
		description: data.description,
		completed: data.completed
			? data.completed.toString().toLowerCase() === 'true'
			: false,
		dueDate: new Date(data.due_date),
		priority: data.priority,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

export function importProjectTasks({
	data,
	permissions: perms,
	projectId,
	userId,
}: {
	data: ProjectTaskImportQueryType[];
	permissions?: ObjectPermissionImportType[];
	projectId?: string;
	userId: string;
}) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getProjectTaskInput);
			// check that every task input has an ID.
			const invalid = input.filter((task) => !task.id);
			if (invalid.length > 0) {
				return reject({
					data: {
						message:
							`An id field is required to avoid duplicate records. The following records do not have an id: ` +
							input.map((task) => task.name).join(','),
						title: 'ID field is required.',
					},
					status: 400,
				});
			}
			const result = await prisma.$transaction(
				input.map((data: any) =>
					prisma.projectTask.upsert({
						where: {
							id: data.id,
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
			await Promise.all(
				result.map((task) =>
					addObjectPermissions({
						model: 'projects_tasks',
						objectId: task.id,
						users: [userId],
					})
				)
			);
			if (perms) await importPermissions(perms);
			// If no permissions were fonud for the tasks, then just add all the project team members
			else if (projectId) {
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
							model: 'projects_tasks',
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

// ********* Project Task Stop ***********

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
