import { prisma, getTaskFollowers } from '../../../../../../../db';
import { auth } from '../../../../../../../middlewares';
import { CreateProjectTeamQueryType } from '../../../../../../../types';
import {
	projectTeamCreateSchema,
	validateParams,
} from '../../../../../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);
		const followers = await getTaskFollowers({
			...params,
			id: req.query.taskId as string,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Task Followers successfully',
			data: followers,
		});
	})
	.post(async (req, res) => {
		const data: CreateProjectTeamQueryType =
			await projectTeamCreateSchema.validateAsync({ ...req.body });

		await prisma.projectTaskFollower.createMany({
			data: data.team.map((member) => ({
				taskId: req.query.taskId as string,
				employeeId: member.employeeId,
				isLeader: member.isLeader,
			})),
			skipDuplicates: true,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Task followers added successfully!',
		});
	});
