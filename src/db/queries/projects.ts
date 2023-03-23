import { Prisma } from '@prisma/client';

import prisma from '../client';
import {
	ParamsType,
	ProjectType,
	ProjectFileType,
	ProjectTaskType,
	ProjectTeamType,
} from '../../types';

// ******** Project Queries Start ***********

export const projectSelectQuery: Prisma.ProjectSelect = {
	id: true,
	completed: true,
	description: true,
	initialCost: true,
	name: true,
	priority: true,
	rate: true,
	startDate: true,
	endDate: true,
	client: {
		select: {
			id: true,
			company: true,
			position: true,
			contact: {
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
		},
	},
	updatedAt: true,
	team: {
		select: {
			id: true,
			employee: {
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
						},
					},
					job: {
						select: {
							name: true,
						},
					},
				},
			},
			isLeader: true,
		},
	},
};

export const getProjectsQuery = ({
	offset,
	limit,
	search = undefined,
	from,
	to,
	where = {},
}: ParamsType & {
	where?: Prisma.ProjectWhereInput;
}): Prisma.ProjectFindManyArgs => {
	const query: Prisma.ProjectFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			name: 'asc' as const,
		},
		select: projectSelectQuery,
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
							client: {
								contact: {
									OR: [
										{
											firstName: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											lastName: {
												contains: search,
												mode: 'insensitive',
											},
										},
										{
											email: {
												contains: search,
												mode: 'insensitive',
											},
										},
									],
								},
							},
						},
					],
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

export const getProjects = async (
	params: ParamsType & {
		where?: Prisma.ProjectWhereInput;
	} = {
		search: undefined,
	}
) => {
	const query = getProjectsQuery(params);

	const [total, result, completed, ongoing] = await prisma.$transaction([
		prisma.project.count({ where: query.where }),
		prisma.project.findMany({ ...query, select: projectSelectQuery }),
		prisma.project.count({
			where: {
				completed: true,
			},
		}),
		prisma.project.count({
			where: {
				completed: false,
			},
		}),
	]);

	return {
		total,
		result: result as unknown as ProjectType[],
		completed,
		ongoing,
	};
};

export const getProject = async (id: string) => {
	const project = (await prisma.project.findUnique({
		where: { id },
		select: projectSelectQuery,
	})) as unknown as ProjectType | null;
	if (!project) return null;

	const tasks = await prisma.projectTask.findMany({
		where: { projectId: project.id },
		select: { completed: true },
	});
	const completedTasks = tasks.filter((task) => task.completed === true).length;
	const ongoingTasks = tasks.filter((task) => task.completed === false).length;
	const totalTasks = completedTasks + ongoingTasks;

	return { ...project, progress: completedTasks / totalTasks };
};

// ******** Project Queries Stop ***********

// ******** File Queries Start **********

export const projectFileSelectQuery: Prisma.ProjectFileSelect = {
	id: true,
	name: true,
	file: true,
	size: true,
	type: true,
	project: {
		select: {
			id: true,
			name: true,
		},
	},
	employee: {
		select: {
			id: true,
			user: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
				},
			},
		},
	},
	updatedAt: true,
};

export const getProjectFilesQuery = ({
	id,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.ProjectFileWhereInput;
}): Prisma.ProjectFileFindManyArgs => {
	const query: Prisma.ProjectFileFindManyArgs = {
		orderBy: {
			updatedAt: 'asc' as const,
		},
		select: projectFileSelectQuery,
		where: {
			projectId: id,
			...where,
		},
	};

	return query;
};

export const getProjectFiles = async (
	params: ParamsType & {
		id: string;
		where?: Prisma.ProjectFileWhereInput;
	} = {
		id: '',
	}
) => {
	const query = getProjectFilesQuery(params);

	const result = await prisma.projectFile.findMany(query);

	return { result: result as unknown as ProjectFileType[] };
};

export const getProjectFile = async (id: string) => {
	const file = (await prisma.projectFile.findUnique({
		where: { id },
		select: projectFileSelectQuery,
	})) as unknown as ProjectFileType | null;
	return file;
};

// ******** File Queries Stop **********

// ******** Team Queries Start ********
export const teamSelectQuery: Prisma.ProjectTeamSelect = {
	id: true,
	isLeader: true,
	employee: {
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
				},
			},
			job: {
				select: {
					name: true,
				},
			},
		},
	},
};

export const getProjectTeamQuery = ({
	offset,
	limit,
	search = undefined,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.ProjectTeamWhereInput;
}): Prisma.ProjectTeamFindManyArgs => {
	const query: Prisma.ProjectTeamFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			employee: {
				user: {
					firstName: 'asc' as const,
				},
			},
		},
		select: teamSelectQuery,
		where: search
			? {
					projectId: id,
					OR: [
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
					],
					...where,
			  }
			: {
					projectId: id,
					...where,
			  },
	};

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getProjectTeam = async (
	params: ParamsType & {
		id: string;
		where?: Prisma.ProjectTeamWhereInput;
	} = {
		search: undefined,
		id: '',
	}
) => {
	const query = getProjectTeamQuery(params);

	const [total, result] = await prisma.$transaction([
		prisma.projectTeam.count({ where: query.where }),
		prisma.projectTeam.findMany(query),
	]);

	return { total, result: result as unknown as ProjectTeamType[] };
};

export const getProjectTeamMember = async (id: string) => {
	const member = (await prisma.projectTeam.findUnique({
		where: { id },
		select: teamSelectQuery,
	})) as unknown as ProjectTeamType | null;
	return member;
};

// ******** Team Queries Stop **********

// ******** Task Queries Start **********

export const taskSelectQuery: Prisma.ProjectTaskSelect = {
	id: true,
	name: true,
	completed: true,
	description: true,
	priority: true,
	dueDate: true,
	updatedAt: true,
	project: {
		select: {
			id: true,
			name: true,
		},
	},
	followers: {
		select: {
			id: true,
			employee: {
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
						},
					},
					job: {
						select: {
							name: true,
						},
					},
				},
			},
			isLeader: true,
		},
	},
};

export const getProjectTasksQuery = ({
	offset,
	limit,
	search = undefined,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.ProjectTaskWhereInput;
}): Prisma.ProjectTaskFindManyArgs => {
	const query: Prisma.ProjectTaskFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			name: 'asc' as const,
		},
		select: taskSelectQuery,
		where: search
			? {
					projectId: id,
					OR: [
						{
							name: {
								contains: search,
								mode: 'insensitive',
							},
						},
						{
							project: {
								name: {
									contains: search,
									mode: 'insensitive',
								},
							},
						},
					],
					...where,
			  }
			: {
					projectId: id,
					...where,
			  },
	};

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getProjectTasks = async (
	params: ParamsType & {
		id: string;
		where?: Prisma.ProjectTaskWhereInput;
	} = {
		search: undefined,
		id: '',
	}
): Promise<{
	total: number;
	completed: number;
	ongoing: number;
	project: {
		id: string;
		name: string;
	};
	result: ProjectTaskType[];
}> => {
	const query = getProjectTasksQuery(params);

	const [total, result, completed, ongoing, project] =
		await prisma.$transaction([
			prisma.projectTask.count({ where: query.where }),
			prisma.projectTask.findMany(query),
			prisma.projectTask.count({
				where: {
					projectId: query.where?.projectId,
					completed: true,
				},
			}),
			prisma.projectTask.count({
				where: {
					projectId: query.where?.projectId,
					completed: false,
				},
			}),
			prisma.project.findUniqueOrThrow({
				where: { id: params.id },
				select: { id: true, name: true },
			}),
		]);

	return {
		total,
		result: result as unknown as ProjectTaskType[],
		completed,
		ongoing,
		project,
	};
};

export const getProjectTask = async (id: string) => {
	const task = await prisma.projectTask.findUnique({
		where: { id },
		select: taskSelectQuery,
	});
	return task as unknown as ProjectTaskType | null;
};

// ******** Task Queries Stop **********

// ******** Task Follower Queries Start **********
export const taskFollowerSelectQuery: Prisma.ProjectTaskFollowerSelect = {
	id: true,
	isLeader: true,
	employee: {
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
				},
			},
			job: {
				select: {
					name: true,
				},
			},
		},
	},
};

export const getTaskFollowersQuery = ({
	offset,
	limit,
	search = undefined,
	id,
	from,
	to,
	where = {},
}: ParamsType & {
	id: string;
	where?: Prisma.ProjectTaskFollowerWhereInput;
}): Prisma.ProjectTaskFollowerFindManyArgs => {
	const query: Prisma.ProjectTaskFollowerFindManyArgs = {
		skip: offset,
		take: limit,
		orderBy: {
			employee: {
				user: {
					firstName: 'asc' as const,
				},
			},
		},
		select: taskFollowerSelectQuery,
		where: search
			? {
					taskId: id,
					OR: [
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
					],
					...where,
			  }
			: {
					taskId: id,
					...where,
			  },
	};

	if (from && to && query.where) {
		query.where.createdAt = {
			gte: from,
			lte: to,
		};
	}

	return query;
};

export const getTaskFollowers = async (
	params: ParamsType & {
		id: string;
		where?: Prisma.ProjectTaskFollowerWhereInput;
	} = {
		search: undefined,
		id: '',
	}
) => {
	const query = getTaskFollowersQuery(params);

	const [total, result] = await prisma.$transaction([
		prisma.projectTaskFollower.count({ where: query.where }),
		prisma.projectTaskFollower.findMany(query),
	]);

	return { total, result: result as unknown as ProjectTeamType[] };
};

export const getTaskFollower = async (id: string) => {
	const follower = await prisma.projectTaskFollower.findUnique({
		where: { id },
		select: taskFollowerSelectQuery,
	});
	return follower as unknown as ProjectTeamType | null;
};

// ******** Task Followers Queries Stop *********
