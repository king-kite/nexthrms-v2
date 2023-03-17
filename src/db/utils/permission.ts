import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';

import prisma from '../client';

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
	users: string[];
}) {
	return prisma.$transaction(
		permissions.map((permission) =>
			prisma.permissionObject.create({
				data: {
					permission,
					modelName,
					objectId,
					users: {
						connect: users.map((user) => ({ id: user })),
					},
				},
				select: { id: true },
			})
		)
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
	users: string[];
}) {
	return prisma.$transaction(
		permissions.map((permission) =>
			prisma.permissionObject.upsert({
				update: {
					users: {
						connect: users.map((user) => ({ id: user })),
					},
				},
				where: {
					modelName_objectId_permission: {
						modelName,
						permission,
						objectId,
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

export async function removeObjectPermissions({
	model: modelName,
	permissions = ['DELETE', 'EDIT', 'VIEW'],
	objectId,
	users,
}: {
	model: PermissionModelChoices;
	permissions?: PermissionObjectChoices[];
	objectId: string;
	users: string[];
}) {
	return prisma.$transaction(
		permissions.map((permission) =>
			prisma.permissionObject.upsert({
				update: {
					users: {
						disconnect: users.map((user) => ({ id: user })),
					},
				},
				where: {
					modelName_objectId_permission: {
						modelName,
						permission,
						objectId,
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

// export async function updateObjectPermissions({
// 	model: modelName,
// 	permissions = ['DELETE', 'EDIT', 'VIEW'],
// 	objectId,
// 	users,
// }: {
// 	model: PermissionModelChoices;
// 	permissions?: PermissionObjectChoices[];
// 	objectId: string;
// 	users: string[];
// }) {
// 	return prisma.$transaction(
// 		permissions.map((permission) =>
// 			prisma.permissionObject.update({
// 				data: {
// 					users: {
// 						connect: users.map((user) => ({ id: user })),
// 					},
// 				},
// 				where: {
// 					modelName_objectId_permission: {
// 						modelName,
// 						permission,
// 						objectId,
// 					},
// 				},
// 				select: { id: true },
// 			})
// 		)
// 	);
// }

// export async function removeObjectPermissions({
// 	model: modelName,
// 	permissions = ['DELETE', 'EDIT', 'VIEW'],
// 	objectId,
// 	users,
// }: {
// 	model: PermissionModelChoices;
// 	permissions?: PermissionObjectChoices[];
// 	objectId: string;
// 	users: string[];
// }) {
// 	return prisma.$transaction(
// 		permissions.map((permission) =>
// 			prisma.permissionObject.update({
// 				data: {
// 					users: {
// 						disconnect: users.map((user) => ({ id: user })),
// 					},
// 				},
// 				where: {
// 					modelName_objectId_permission: {
// 						modelName,
// 						permission,
// 						objectId,
// 					},
// 				},
// 				select: { id: true },
// 			})
// 		)
// 	);
// }
