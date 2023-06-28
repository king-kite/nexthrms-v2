import {
	PermissionModelChoices,
	PermissionObjectChoices,
	Prisma,
} from '@prisma/client';

import { models } from '../../config';
import prisma from '../../db';
import { AuthDataType, PermissionType, RequestUserType } from '../../types';

// return distinct permissions from the groups permission and user permissions;
export function getDistinctPermissions(
	permissions: PermissionType[]
): PermissionType[] {
	// A variable to store the IDs of permissions that have been found
	const permissionIds: string[] = [];

	const distinctPermissions = permissions.filter((permission) => {
		// Check to see if the permission id is not in the permissionsIds variable
		// return permission if it's not and add the id to the variable
		if (!permissionIds.includes(permission.id)) {
			permissionIds.push(permission.id);
			return permission;
		}
	});

	return distinctPermissions;
}

export async function serializeUserData(
	user: Omit<RequestUserType, 'checkPassword'>
): Promise<AuthDataType> {
	let data: AuthDataType = {
		firstName: user.firstName,
		lastName: user.lastName,
		fullName: user.fullName || user.firstName + ' ' + user.lastName,
		email: user.email,
		profile: user.profile
			? {
					image: user.profile.image,
			  }
			: null,
		employee: null,
		permissions: getDistinctPermissions([
			...user.permissions,
			...user.groups.reduce((acc: PermissionType[], group) => {
				// Only active groups
				if (group.active) return [...acc, ...group.permissions];
				return acc;
			}, []),
		]),
		objPermissions: await getUserModelObjectPermissions({
			userId: user.id,
		}),
	};
	if (user.employee) {
		data.employee = {
			id: user.employee.id,
		};
		if (user.employee.job) {
			data.employee.job = {
				name: user.employee.job.name,
			};
		}
	}
	if (user.isAdmin) data.isAdmin = true;
	if (user.isSuperUser) data.isSuperUser = true;

	return data;
}

// A function to check if the user has a certain object permission
// for a model. By default it gets the VIEW object permission
// for all models for the provided user ID
export async function getUserModelObjectPermissions({
	modelNames = models,
	permission = 'VIEW',
	userId,
}: {
	modelNames?: PermissionModelChoices[];
	permission?: PermissionObjectChoices;
	userId: string;
}): Promise<
	{
		modelName: PermissionModelChoices;
		permission: PermissionObjectChoices;
	}[]
> {
	try {
		const objPermissions = modelNames.reduce(
			(
				acc: Prisma.Prisma__PermissionObjectClient<
					{
						modelName: PermissionModelChoices;
						permission: PermissionObjectChoices;
					} | null,
					null
				>[],
				modelName
			) => {
				const result = prisma.permissionObject.findFirst({
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
										active: true, // Only active groups
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
						modelName: true,
						permission: true,
					},
				});
				return [...acc, result];
			},
			[]
		);

		const results = await prisma.$transaction(objPermissions);
		const data = results.reduce(
			(
				acc: {
					modelName: PermissionModelChoices;
					permission: PermissionObjectChoices;
				}[],
				item
			) => {
				if (item === null) return acc;
				return [...acc, item];
			},
			[]
		);
		return data;
	} catch (error) {
		throw error;
	}
}
