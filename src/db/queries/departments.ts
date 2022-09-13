import { Department, Prisma } from '@prisma/client';

import prisma from '../client';
import { DEFAULT_PAGINATION_SIZE } from '../../config';
import { DepartmentType } from '../../types';

type ParamsType = {
	offset?: number;
	limit?: number;
	search?: string;
};

export const departmentSelectQuery: Prisma.DepartmentSelect = {
	id: true,
	name: true,
	hod: {
		select: {
			id: true,
			user: {
				select: {
					firstName: true,
					lastName: true,
					email: true,
					profile: {
						select: {
							image: true,
						},
					},
					employee: {
						select: {
							job: {
								select: {
									name: true,
								},
							},
						},
					},
				},
			},
		},
	},
	_count: {
		select: { employees: true },
	},
};

export const getDepartmentsQuery = ({
	offset = 0,
	limit = DEFAULT_PAGINATION_SIZE,
	search = undefined,
}: ParamsType): Prisma.DepartmentFindManyArgs => {
	const query: Prisma.DepartmentFindManyArgs = {
		skip: offset,
		take: limit,
		select: departmentSelectQuery,
		where: search
			? {
					name: {
						contains: search,
						mode: 'insensitive',
					},
			  }
			: {},
	};

	return query;
};

export const getDepartments = async (
	params?: ParamsType
): Promise<{ total: number; result: Department[] | DepartmentType[] }> => {
	const query = getDepartmentsQuery({ ...params });
	const [total, result] = await prisma.$transaction([
		prisma.department.count({ where: query.where }),
		prisma.department.findMany({
			...query,
			orderBy: {
				name: 'asc',
			},
		}),
	]);
	return { total, result };
};
