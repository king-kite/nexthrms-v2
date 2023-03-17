import {
	Prisma,
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';

import prisma from '../client';
import {
	ParamsType,
	PermissionType,
	PermissionCategoryType,
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
	where = {},
}: ParamsType & {
	where?: Prisma.PermissionWhereInput;
}): Prisma.PermissionFindManyArgs => {
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
					...where,
			  }
			: where,
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
	modelName: PermissionModelChoices,
	objectId: string,
	permission?: PermissionObjectChoices,
	options?: {
		groups?: {
			limit?: number;
			offset?: number;
			search?: string;
		};
		users?: {
			limit?: number;
			offset?: number;
			search?: string;
		};
	}
) => {
	let selectQuery: Prisma.PermissionObjectSelect = objectPermissionSelectQuery;
	if (options) {
		// Paginate Groups If Neccessary
		if (
			options.groups &&
			selectQuery.groups &&
			typeof selectQuery.groups !== 'boolean'
		) {
			selectQuery.groups.take = options.groups.limit || undefined;
			selectQuery.groups.skip = options.groups.offset || undefined;
			if (options.groups.search) {
				selectQuery.groups.where = {
					OR: [
						{
							name: {
								contains: options.groups.search,
								mode: 'insensitive',
							},
						},
					],
				};
			}
		}

		// Paginate Users If Neccessary
		if (
			options.users &&
			selectQuery.users &&
			typeof selectQuery.users !== 'boolean'
		) {
			selectQuery.users.take = options.users.limit || undefined;
			selectQuery.users.skip = options.users.offset || undefined;
			if (options.users.search) {
				selectQuery.users.where = {
					OR: [
						{
							firstName: {
								contains: options.users.search,
								mode: 'insensitive',
							},
						},
						{
							lastName: {
								contains: options.users.search,
								mode: 'insensitive',
							},
						},
						{
							email: {
								contains: options.users.search,
								mode: 'insensitive',
							},
						},
					],
				};
			}
		}
	}
	const result = await prisma.permissionObject.findMany({
		where: permission
			? {
					modelName,
					objectId,
					permission,
			  }
			: { modelName, objectId },
		select: selectQuery,
	});

	return { result };
};

export const getPermission = async (id: string) => {
	const permission = await prisma.permission.findUnique({
		where: { id },
		select: permissionSelectQuery,
	});

	return permission as unknown as PermissionType | null;
};

export const getPermissionCategory = async (id: string) => {
	const category = await prisma.permissionCategory.findUnique({
		where: { id },
		select: permissionCategorySelectQuery,
	});

	return category as unknown as PermissionCategoryType | null;
};

export const getPermissions = async (
	params: ParamsType & {
		where?: Prisma.PermissionWhereInput;
	} = {
		search: undefined,
	}
): Promise<{
	total: number;
	result: PermissionType[];
}> => {
	const query = getPermissionsQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.permission.count({ where: query.where }),
		prisma.permission.findMany(query),
	]);

	return {
		total,
		result: result as unknown as PermissionType[],
	};
};

export const getPermissionCategories = async (
	params: ParamsType = {
		search: undefined,
	}
): Promise<{
	total: number;
	result: PermissionCategoryType[];
}> => {
	const query = getPermissionCategoriesQuery({ ...params });

	const [total, result] = await prisma.$transaction([
		prisma.permissionCategory.count({ where: query.where }),
		prisma.permissionCategory.findMany(query),
	]);

	return {
		total,
		result: result as unknown as PermissionCategoryType[],
	};
};
