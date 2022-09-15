import { prisma, getProjectTeam } from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { CreateProjectTeamQueryType } from '../../../../../types';
import {
	projectTeamCreateSchema,
	validateParams,
} from '../../../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);
		const team = await getProjectTeam({
			...params,
			id: req.query.id as string,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched team successfully. A total of ' + team.total,
			data: team,
		});
	})
	.post(async (req, res) => {
		const data: CreateProjectTeamQueryType =
			await projectTeamCreateSchema.validateAsync({ ...req.body });

		const team = await prisma.projectTeam.createMany({
			data: data.team.map((member) => ({
				projectId: req.query.id as string,
				employeeId: member.employeeId,
				isLeader: member.isLeader,
			})),
			skipDuplicates: true,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Team members add successfully!',
		});
	});
