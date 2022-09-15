import {
	prisma,
	getProjects,
	projectSelectQuery as selectQuery,
} from '../../../db';
import { auth } from '../../../middlewares';
import { CreateProjectQueryType } from '../../../types';
import { projectCreateSchema, validateParams } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);
		const data = await getProjects({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched projects successfully. A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const data: CreateProjectQueryType =
			await projectCreateSchema.validateAsync({ ...req.body });

		const project = await prisma.project.create({
			data: {
				...data,
				client: data.client
					? {
							connect: {
								id: data.client,
							},
					  }
					: undefined,
				team:
					data.team && data.team.length > 0
						? {
								createMany: {
									data: data.team.map(({ employeeId, isLeader = false }) => ({
										employeeId,
										isLeader,
									})),
									skipDuplicates: true,
								},
						  }
						: {},
			},
			select: selectQuery,
		});
		return res.status(201).json({
			status: 'success',
			message: 'Created project successfully!',
			data: project,
		});
	});
