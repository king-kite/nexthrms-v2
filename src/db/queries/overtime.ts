import { Prisma } from '@prisma/client';

import prisma from '..';
import type {
	CreateOvertimeQueryType,
	OvertimeImportQueryType,
	ParamsType,
} from '../../types';
import { NextErrorMessage } from '../../utils/classes';
import { getDate } from '../../utils/dates';

type OvertimeCreateQueryType = Omit<CreateOvertimeQueryType, 'employee'> & {
	employeeId: string;
};

const employeeSelectQuery = {
	id: true,
	user: {
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			profile: {
				select: {
					image: {
						select: {
							id: true,
							url: true,
						},
					},
				},
			},
		},
	},
	department: {
		select: {
			name: true,
		},
	},
	job: {
		select: {
			name: true,
		},
	},
};

const select = {
	id: true,
	date: true,
	hours: true,
	reason: true,
	type: true,
	status: true,
	employee: {
		select: employeeSelectQuery,
	},
	createdBy: {
		select: employeeSelectQuery,
	},
	approvedBy: {
		select: employeeSelectQuery,
	},
	updatedAt: true,
	createdAt: true,
};

export type OvertimeType = Prisma.OvertimeGetPayload<{ select: typeof select }>;

// ****** Personal Overtime Start ******

export function getAllOvertimeQuery({
	offset,
	limit,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.OvertimeWhereInput;
}) {
	const query: Prisma.OvertimeFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc',
		},
		where: {
			employee: { id },
			...where,
		},
		select,
	};

	if (from && to) {
		query.where = {
			...query.where,
			date: {
				gte: from,
				lte: to,
			},
		};
	}

	return query;
}

// Get all overtime for a user
export async function getAllOvertime(
	params: ParamsType & {
		id: string;
		where?: Prisma.OvertimeWhereInput;
	}
) {
	const query = getAllOvertimeQuery(params);

	const currentDate = getDate() as Date;

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'APPROVED' },
		}),
		prisma.overtime.count({
			where: {
				...query.where,
				employeeId: params.id,
				status: 'PENDING',
				date: {
					gte: currentDate,
				},
			},
		}),
		prisma.overtime.count({
			where: { ...query.where, employeeId: params.id, status: 'DENIED' },
		}),
	]);

	return {
		total,
		approved,
		pending,
		denied,
		result,
	};
}

// Get single overtime
export async function getOvertime(id: string) {
	const overtime = await prisma.overtime.findUnique({
		where: { id },
		select,
	});
	return overtime;
}

// Create overtime
export async function createOvertime(data: OvertimeCreateQueryType) {
	// Check if the user has an approved/pending overtime request
	const exists = await prisma.overtime.findFirst({
		where: {
			date: data.date,
			employeeId: data.employeeId,
			status: {
				in: ['APPROVED', 'PENDING'],
			},
		},
	});
	if (exists)
		throw new NextErrorMessage(
			400,
			'An approved or pending overtime request already exists for this date.'
		);

	return prisma.overtime.create({
		data,
		select,
	});
}

// Update overtime
export async function updateOvertime(
	id: string,
	data: Prisma.OvertimeUpdateInput
) {
	return await prisma.overtime.update({
		where: { id },
		data,
		select,
	});
}

// Delete overtime
export async function deleteOvertime(id: string) {
	return await prisma.overtime.delete({
		where: { id },
	});
}

// ****** Personal Overtime Stop ******

// ****** Admin Overtime Start ******

export function getAllOvertimeAdminQuery({
	offset,
	limit,
	search = '',
	from,
	to,
	where: paramsWhere = {},
	select: paramsSelect = {},
}: ParamsType & {
	where?: Prisma.OvertimeWhereInput;
	select?: Prisma.OvertimeSelect;
}) {
	const where: Prisma.OvertimeWhereInput =
		search || (from && to)
			? {
					OR: search
						? [
								{
									employee: {
										user: {
											firstName: {
												contains: search,
												mode: 'insensitive',
											},
										},
									},
								},
								{
									employee: {
										user: {
											lastName: {
												contains: search,
												mode: 'insensitive',
											},
										},
									},
								},
								{
									employee: {
										user: {
											email: {
												contains: search,
												mode: 'insensitive',
											},
										},
									},
								},
						  ]
						: undefined,
					AND:
						from && to
							? {
									date: {
										gte: from,
										lte: to,
									},
							  }
							: undefined,
					...paramsWhere,
			  }
			: paramsWhere;

	const query = {
		skip: offset,
		take: limit,
		orderBy: {
			createdAt: 'desc' as const,
		},
		where,
		select: {
			...select,
			...paramsSelect,
		},
	};

	return query;
}

export async function getAllOvertimeAdmin(
	params: ParamsType & {
		where?: Prisma.OvertimeWhereInput;
		select?: Prisma.OvertimeSelect;
	} = {
		search: '',
	}
) {
	const query = getAllOvertimeAdminQuery({ ...params });

	const currentDate = getDate();

	const [total, result, approved, pending, denied] = await prisma.$transaction([
		prisma.overtime.count({ where: query.where }),
		prisma.overtime.findMany(query),
		prisma.overtime.count({ where: { ...query.where, status: 'APPROVED' } }),
		prisma.overtime.count({
			where: {
				...query.where,
				status: 'PENDING',
				date: {
					gte: currentDate,
				},
			},
		}),
		prisma.overtime.count({ where: { ...query.where, status: 'DENIED' } }),
	]);

	return {
		total,
		approved,
		pending,
		denied,
		result,
	};
}

// **** Import Overtime Start ****

function getDataInput(data: OvertimeImportQueryType) {
	const date = new Date(data.date);
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		reason: data.reason,
		date,
		type: data.type,
		hours: +data.hours,
		status: data.status,
		employee: data.employee,
		createdBy: data.created_by ? data.created_by : undefined,
		approvedBy: data.approved_by ? data.approved_by : undefined,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

export async function importOvertime(overtime: OvertimeImportQueryType[]) {
	const input = overtime.map(getDataInput);

	const emails = input.reduce((acc: string[], item) => {
		const value = [...acc];
		value.push(item.employee);
		if (item.createdBy) value.push(item.createdBy);
		if (item.approvedBy) value.push(item.approvedBy);
		return value;
	}, []);

	// Get employees required for imports
	const employees = await prisma.employee.findMany({
		where: {
			user: {
				email: {
					in: emails,
				},
			},
		},
		select: { id: true, user: { select: { email: true } } },
	});

	// Make sure that all employees provided in the import data are found.
	// If one is missing throw an error and do not import
	const notFound = input.filter((item) => {
		const employee = employees.find(
			(employee) => employee.user.email === item.employee
		);
		const createdBy = employees.find(
			(employee) => employee.user.email === item.createdBy
		);
		const approvedBy = employees.find(
			(employee) => employee.user.email === item.approvedBy
		);

		// check approvedBy
		if (item.approvedBy && !approvedBy) return true;
		if (item.createdBy && !createdBy) return true;
		if (!employee) return true;
		return false;
	});
	if (notFound.length > 0) {
		const email = notFound.map((item) => item.employee).join(', ');
		const m = notFound.length > 1 ? 's' : '';
		const message =
			`Could not find employee${m} with the following email${m}: '${email}'`.trim() +
			'.';
		throw new NextErrorMessage(400, message);
	}

	// overwrite the employee field in each input item to the id found in the employees array
	const data = input.map((item) => ({
		...item,
		employeeId:
			employees.find((employee) => employee.user.email === item.employee)?.id ||
			'',
		createdById:
			employees.find((employee) => employee.user.email === item.createdBy)
				?.id || '',
		approvedById:
			employees.find((employee) => employee.user.email === item.approvedBy)
				?.id || '',
		employee: undefined,
		createdBy: undefined,
		approvedBy: undefined,
	}));

	return prisma.$transaction(
		data.map((data) =>
			prisma.overtime.upsert({
				where: data.id ? { id: data.id } : {},
				update: data,
				create: data,
				select: {
					id: true,
					employee: {
						select: {
							user: {
								select: { id: true },
							},
							department: {
								select: {
									hod: {
										select: {
											user: {
												select: {
													id: true,
												},
											},
										},
									},
								},
							},
							supervisors: {
								select: {
									user: {
										select: {
											id: true,
										},
									},
								},
							},
						},
					},
				},
			})
		)
	);
}

// **** Import Overtime Stop ****

// ****** Admin Overtime Stop ******
