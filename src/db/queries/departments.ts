import { Prisma } from '@prisma/client';

import prisma from '../client';
import { DepartmentType, ParamsType } from '../../types';

export const departmentSelectQuery: Prisma.DepartmentSelect = {
	id: true,
	name: true,
	updatedAt: true,
	createdAt: true,
	hod: {
		select: {
			id: true,
			user: {
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
	offset,
	limit,
	search = undefined,
	from,
	to,
	where = {},
	select = {},
}: ParamsType & {
	where?: Prisma.DepartmentWhereInput;
	select?: Prisma.DepartmentSelect;
}): Prisma.DepartmentFindManyArgs => {
	const query: Prisma.DepartmentFindManyArgs = {
		skip: offset,
		take: limit,
		select: {
			...departmentSelectQuery,
			...select,
		},
		where: search
			? {
					name: {
						contains: search,
						mode: 'insensitive',
					},
					...where,
			  }
			: where,
	};

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getDepartments = async (
	params?: ParamsType & {
		where?: Prisma.DepartmentWhereInput;
		select?: Prisma.DepartmentSelect;
	}
): Promise<{ total: number; result: DepartmentType[] }> => {
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
	return { total, result: result as unknown as DepartmentType[] };
};

export async function getDepartment(id: string) {
	const result = await prisma.department.findUnique({
		where: { id },
		select: departmentSelectQuery,
	});
	return result as unknown as DepartmentType | null;
}
