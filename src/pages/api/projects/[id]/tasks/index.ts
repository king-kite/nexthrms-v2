import {
	prisma,
	getProjectTasks,
	taskSelectQuery as selectQuery,
} from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { CreateProjectTaskQueryType } from '../../../../../types';
import { taskCreateSchema, validateParams } from '../../../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);
		const tasks = await getProjectTasks({
			...params,
			id: req.query.id as string,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched tasks successfully',
			data: tasks,
		});
	})
	.post(async (req, res) => {
		const data: CreateProjectTaskQueryType =
			await taskCreateSchema.validateAsync({ ...req.body });

		const task = await prisma.projectTask.create({
			data: {
				...data,
				project: {
					connect: {
						id: req.query.id as string,
					},
				},
				followers:
					data.followers && data.followers.length > 0
						? {
								createMany: {
									data: data.followers.map(
										({ employeeId, isLeader = false }) => ({
											employeeId,
											isLeader,
										})
									),
									skipDuplicates: true,
								},
						  }
						: {},
			},
			select: selectQuery,
		});
		return res.status(201).json({
			status: 'success',
			message: 'Created Project Task successfully!',
			data: task,
		});
	});
