import {
	addObjectPermissions,
	importPermissions,
	updateObjectPermissions,
} from './permission';
import prisma from '../client';
import { getProjectTeam } from '../queries';
import {
	ProjectFileImportQueryType,
	ObjectPermissionImportType,
} from '../../types';

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
