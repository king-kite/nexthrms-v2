import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';

import prisma from '../client';
import { ObjectPermissionImportType } from '../../types';

// A function to check if a user has view, edit or delete
// permissions concerning an object in a model
/** How to pass the params
 * e.g. 1. To get all permissions i.e. VIEW && EDIT && DELETE,
 *         leave permission param key as undefined
 * {
 *  modelName: 'leave',
 *  objectId: '3hj2k2j-2823-jgmw-24072s',
 *  userId: '3hj2k2j-2823-jgmw-24072s',
 * }
 *
 * e.g. 2. To get just one permission i.e VIEW || EDIT || DELETE only,
 *         set the permission param key choice
 * {
 *  modelName: 'leave',
 *  objectId: '3hj2k2j-2823-jgmw-24072s',
 *  userId: '3hj2k2j-2823-jgmw-24072s',
 *  permission: 'VIEW'
 * }
 */

export async function getUserObjectPermissions({
	modelName,
	objectId,
	userId,
	permission,
}: {
	modelName: PermissionModelChoices;
	objectId: string;
	userId: string;
	permission?: PermissionObjectChoices;
}) {
	try {
		// Should return for permission VIEW, EDIT, DELETE
		// Thats if the permission object exists
		const objPermissions = await prisma.permissionObject.findMany({
			where: {
				modelName,
				objectId,
				permission,
				OR: [
					{
						users: {
							some: {
								id: userId,
							},
						},
					},
					{
						groups: {
							some: {
								users: {
									some: {
										id: userId,
									},
								},
							},
						},
					},
				],
			},
			select: {
				permission: true,
			},
		});

		const permissions = objPermissions.reduce(
			(acc, objPerm) => {
				const obj: {
					delete: boolean;
					edit: boolean;
					view: boolean;
				} = {
					...acc,
					[objPerm.permission.toLowerCase()]: true,
				};
				return obj;
			},
			{
				delete: false,
				edit: false,
				view: false,
			}
		);

		return permissions;
	} catch (error) {
		throw error;
	}
}

// A function to get an array of IDs from a model
// where the user has a certain permission or permissions

/** How to pass the params
 * e.g. 1. To get all the objects in a model where the user has only VIEW permission
 *  {
 *    modelName: 'leaves',
 *    userId: '3hj2k2j-2823-jgmw-24072s',
 *    permission: 'VIEW'
 *  }
 *
 * e.g. 2. To get all the objects in a model where a user has at least a permission,
 *         leave the permission param key as undefined
 *  {
 *    modelName: 'leaves',
 *    userId: '3hj2k2j-2823-jgmw-24072s'
 *  }
 */
export async function getUserObjects({
	modelName,
	userId,
	permission,
}: {
	modelName: PermissionModelChoices;
	userId: string;
	permission?: PermissionObjectChoices;
}) {
	try {
		return await prisma.permissionObject.findMany({
			where: {
				modelName,
				permission,
				OR: [
					{
						users: {
							some: {
								id: userId,
							},
						},
					},
					{
						groups: {
							some: {
								users: {
									some: {
										id: userId,
									},
								},
							},
						},
					},
				],
			},
			select: {
				objectId: true,
				permission: true,
			},
		});
	} catch (error) {
		throw error;
	}
}

export async function addObjectPermissions({
	model: modelName,
	permissions = ['DELETE', 'EDIT', 'VIEW'],
	objectId,
	users,
}: {
	model: PermissionModelChoices;
	permissions?: PermissionObjectChoices[];
	objectId: string;
	users: (string | undefined)[];
}) {
	const filteredUsers = users.filter((id) => id !== undefined);
	if (filteredUsers.length > 0)
		return prisma.$transaction(
			permissions.map((permission) => {
				const data = {
					permission,
					modelName,
					objectId,
					users: {
						connect: filteredUsers.map((user) => ({ id: user })),
					},
				};
				return prisma.permissionObject.upsert({
					where: {
						modelName_objectId_permission: {
							permission: data.permission,
							modelName: data.modelName,
							objectId: data.objectId,
						},
					},
					update: data,
					create: data,
					select: { id: true },
				});
			})
		);
}

export async function updateObjectPermissions({
	model: modelName,
	permissions = ['DELETE', 'EDIT', 'VIEW'],
	objectId,
	users,
}: {
	model: PermissionModelChoices;
	permissions?: PermissionObjectChoices[];
	objectId: string;
	users: (string | undefined)[];
}) {
	const filteredUsers = users.filter((id) => id !== undefined);
	if (filteredUsers.length > 0)
		return prisma.$transaction(
			permissions.map((permission) =>
				prisma.permissionObject.upsert({
					where: {
						modelName_objectId_permission: {
							modelName,
							permission,
							objectId,
						},
					},
					update: {
						users: {
							connect: filteredUsers.map((user) => ({ id: user })),
						},
					},
					create: {
						modelName,
						permission,
						objectId,
						users: {
							connect: filteredUsers.map((user) => ({ id: user })),
						},
					},
					select: { id: true },
				})
			)
		);
}

export async function removeObjectPermissions({
	model: modelName,
	permissions = ['DELETE', 'EDIT', 'VIEW'],
	objectId,
	users,
}: {
	model: PermissionModelChoices;
	permissions?: PermissionObjectChoices[];
	objectId: string;
	users: (string | undefined)[];
}) {
	const filteredUsers = users.filter((id) => id !== undefined);
	if (filteredUsers.length > 0)
		return prisma.$transaction(
			permissions.map((permission) =>
				prisma.permissionObject.upsert({
					where: {
						modelName_objectId_permission: {
							modelName,
							permission,
							objectId,
						},
					},
					update: {
						users: {
							disconnect: filteredUsers.map((user) => ({ id: user })),
						},
					},
					create: {
						modelName,
						permission,
						objectId,
					},
					select: { id: true },
				})
			)
		);
}

export async function getEmployeeOfficersId(id: string) {
	// simply get the employee and get he's supervisors and hod
	// get the superusers will be admins
	const [employee, admins] = await prisma.$transaction([
		prisma.employee.findUnique({
			where: { id },
			select: {
				department: {
					select: {
						hod: {
							select: {
								user: {
									select: {
										id: true,
										isActive: true,
									},
								},
							},
						},
					},
				},
				supervisors: {
					where: {
						user: {
							isActive: true,
							isAdmin: true,
						},
					},
					select: {
						user: {
							select: {
								id: true,
							},
						},
					},
				},
			},
		}),
		prisma.user.findMany({
			where: {
				isActive: true,
				isSuperUser: true,
			},
			select: { id: true },
		}),
	]);
	const officers = admins.map((admin) => admin.id);
	if (employee) {
		if (
			employee.department?.hod &&
			employee.department.hod.user.isActive &&
			!officers.includes(employee.department.hod.user.id)
		)
			officers.push(employee.department.hod.user.id);

		employee.supervisors.forEach((supervisor) => {
			if (!officers.includes(supervisor.user.id))
				officers.push(supervisor.user.id);
		});
	}

	return officers;
}

export async function getObjectPermissionExportData({
	ids,
	model: modelName,
}: {
	ids: string[];
	model: PermissionModelChoices;
}) {
	const objectPermissions = await prisma.permissionObject.findMany({
		where: {
			modelName,
			objectId: {
				in: ids,
			},
		},
		include: {
			groups: {
				select: {
					name: true,
				},
			},
			users: {
				select: {
					email: true,
				},
			},
		},
	});
	// as any as {
	// 	objectId: string;
	// 	permission: PermissionObjectChoices;
	// 	groups: {
	// 		name: string;
	// 	}[];
	// 	users: {
	// 		email: string;
	// 	}[];
	// }[];

	const perms = objectPermissions.reduce(
		(acc: ObjectPermissionImportType[], perm) => {
			const data: ObjectPermissionImportType[] = [];
			perm.users.forEach((user) => {
				data.push({
					model_name: modelName,
					name: user.email,
					object_id: perm.objectId,
					permission: perm.permission,
					is_user: true,
				});
			});
			perm.groups.forEach((group) => {
				data.push({
					model_name: modelName,
					name: group.name,
					object_id: perm.objectId,
					permission: perm.permission,
					is_user: false,
				});
			});

			return [...acc, ...data];
		},
		[]
	);

	return perms;
}

function getObjectPermissionInput(objPerm: ObjectPermissionImportType) {
	return {
		modelName: objPerm.model_name,
		objectId: objPerm.object_id,
		permission: objPerm.permission,
		users: objPerm.is_user
			? {
					connect: {
						email: objPerm.name,
					},
			  }
			: undefined,
		groups: !objPerm.is_user
			? {
					connect: {
						name: objPerm.name,
					},
			  }
			: undefined,
	};
}

export function importPermissions(data: ObjectPermissionImportType[]) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getObjectPermissionInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.permissionObject.upsert({
						where: {
							modelName_objectId_permission: {
								modelName: data.modelName,
								objectId: data.objectId,
								permission: data.permission,
							},
						},
						update: data,
						create: data,
						select: { id: true },
					})
				)
			);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}
