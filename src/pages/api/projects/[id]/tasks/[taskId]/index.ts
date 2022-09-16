import {
	prisma,
	getProjectTask,
	taskSelectQuery as selectQuery,
} from '../../../../../../db';
import { auth } from '../../../../../../middlewares';
import { CreateProjectTaskQueryType } from '../../../../../../types';
import { taskCreateSchema } from '../../../../../../validators';

export default auth()
	.get(async (req, res) => {
		const task = await getProjectTask(req.query.taskId as string);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Project Task Successfully!',
			data: task,
		});
	})
	.put(async (req, res) => {
		const valid: CreateProjectTaskQueryType =
			await taskCreateSchema.validateAsync({ ...req.body });

		const { followers, ...data } = valid;

		// delete old project task followers in a team array is passed
		if (followers && Array.isArray(followers))
			await prisma.projectTaskFollower.deleteMany({
				where: { taskId: req.query.taskId as string },
			});

		// update the project task
		const project = await prisma.projectTask.update({
			where: { id: req.query.taskId as string },
			data: {
				...data,
				followers:
					followers && followers.length > 0
						? {
								createMany: {
									data: followers.map(({ employeeId, isLeader = false }) => ({
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

		return res.status(200).json({
			status: 'success',
			message: 'Project Task was updated successfully',
			data: project,
		});
	})
	.delete(async (req, res) => {
		await prisma.projectTask.delete({
			where: { id: req.query.taskId as string },
		});

		return res.status(200).json({
			status: 'success',
			message: 'Project task deleted successfully!',
		});
	});
