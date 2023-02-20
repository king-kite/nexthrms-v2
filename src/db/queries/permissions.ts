import { Prisma, Permission, PermissionCategory } from '@prisma/client';

import prisma from '../client';
import {
	ParamsType,
	PermissionType,
	PermissionCategoryType,
	PermissionModelNameType,
} from '../../types';

export const objectPermissionSelectQuery = {
	users: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			profile: {
				select: {
					image: true,
				},
			},
		},
	},
	permission: true,
	groups: {
		select: {
			id: true,
			name: true,
		},
	},
};

export const permissionCategorySelectQuery: Prisma.PermissionCategorySelect = {
	id: true,
	name: true,
};

export const permissionSelectQuery: Prisma.PermissionSelect = {
	id: true,
	name: true,
	category: {
		select: permissionCategorySelectQuery,
	},
	codename: true,
	description: true,
};

export const getPermissionsQuery = ({
	offset,
	limit,
	search = undefined,
}: ParamsType): Prisma.PermissionFindManyArgs => {
	const query: Prisma.PermissionFindManyArgs = {
		select: permissionSelectQuery,
		orderBy: {
			category: {
				name: 'asc' as const,
			},
		},
		where: search
			? {
					OR: [
						{
							name: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							codename: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							category: {
								name: {
									contains: search,
									mode: 'insensitive',
								},
							},
						},
					],
			  }
			: {},
	};

	if (offset) query.skip = offset;
	if (limit) query.take = limit;

	return query;
};

export const getPermissionCategoriesQuery = ({
	offset,
	limit,
	search = undefined,
}: ParamsType): Prisma.PermissionCategoryFindManyArgs => {
	const query: Prisma.PermissionCategoryFindManyArgs = {
		select: permissionCategorySelectQuery,
		orderBy: {
			name: 'asc' as const,
		},
		where: search
			? {
					OR: [
						{
							name: {
								contains: search,
								mode: 'insensitive',
							},
						},
					],
			  }
			: {},
	};

	if (offset !== undefined) query.skip = offset;
	if (limit !== undefined) query.take = limit;

	return query;
};

export const getObjectPermissions = async (
	modelName: PermissionModelNameType,
	objectId: string,
	permission?: 'CREATE' | 'DELETE' | 'EDIT' | 'VIEW'
) => {
	const result = await prisma.permissionObject.findMany({
		where: {
			modelName,
			objectId,
			permission,
		},
		select: objectPermissionSelectQuery,
	});

	return { result };
};

export const getPermission = async (id: string) => {
	const permission = await prisma.permission.findUnique({
		where: { id },
		select: permissionSelectQuery,
	});

	return permission;
};

export const getPermissionCategory = async (id: string) => {
	const category = await prisma.permissionCategory.findUnique({
		where: { id },
		select: permissionCategorySelectQuery,
	});

	return category;
};

export const getPermissions = async (
	params: ParamsType = {
		search: undefined,
	}
): Promise<{
	total: number;
	result: PermissionType[] | Permission[];
}> => {
	const query = getPermissionsQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.permission.count({ where: query.where }),
		prisma.permission.findMany(query),
	]);

	return {
		total,
		result,
	};
};

export const getPermissionCategories = async (
	params: ParamsType = {
		search: undefined,
	}
): Promise<{
	total: number;
	result: PermissionCategoryType[] | PermissionCategory[];
}> => {
	const query = getPermissionCategoriesQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.permissionCategory.count({ where: query.where }),
		prisma.permissionCategory.findMany(query),
	]);

	return {
		total,
		result,
	};
};
