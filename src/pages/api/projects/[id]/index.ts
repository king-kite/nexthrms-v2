import {
	prisma,
	getProject,
	projectSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { CreateProjectQueryType } from '../../../../types';
import { projectCreateSchema } from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const project = await getProject(req.query.id as string);
		if (!project) {
			return res.status(404).json({
				status: 'error',
				message: 'Project with specified ID does not exist',
			});
		}
		return res.status(200).json({
			status: 'success',
			mesage: 'Fetched project successfully!',
			data: project,
		});
	})
	.put(async (req, res) => {
		const valid: CreateProjectQueryType =
			await projectCreateSchema.validateAsync({ ...req.body });

		const { team, ...data } = valid;

		// delete old project team in a team array is passed
		if (team && Array.isArray(team))
			await prisma.projectTeam.deleteMany({
				where: { projectId: req.query.id as string },
			});

		// update the project
		const project = await prisma.project.update({
			where: { id: req.query.id as string },
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
					team && team.length > 0
						? {
								createMany: {
									data: team.map(({ employeeId, isLeader = false }) => ({
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
			message: 'Project updated successfully',
			data: project,
		});
	})
	.delete(async (req, res) => {
		await prisma.project.delete({ where: { id: req.query.id as string } });
		return res.status(200).json({
			status: 'success',
			message: 'Project deleted successfully!',
		});
	});
