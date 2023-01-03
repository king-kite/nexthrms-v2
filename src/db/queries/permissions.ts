import { Prisma, Permission, PermissionCategory } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config/settings';
import {
	ParamsType,
	PermissionType,
	PermissionCategoryType,
} from '../../types';

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
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
	all = false,
}: ParamsType): Prisma.PermissionFindManyArgs => {
	const query: Prisma.PermissionFindManyArgs = {
		select: permissionSelectQuery,
		orderBy: {
			category: {
				name: 'asc' as const,
			},
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

	if (all === false) {
		if (offset !== undefined) query.skip = offset;
		if (limit !== undefined) query.take = limit;
	}

	return query;
};

export const getPermissionCategoriesQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
	all = false,
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

	if (all === false) {
		if (offset !== undefined) query.skip = offset;
		if (limit !== undefined) query.take = limit;
	}

	return query;
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
	params: ParamsType
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
	params: ParamsType
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
