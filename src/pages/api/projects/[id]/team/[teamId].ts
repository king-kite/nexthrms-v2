import {
	prisma,
	getProjectTeamMember,
	teamSelectQuery as selectQuery,
} from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { projectTeamMemberUpdateSchema } from '../../../../../validators';

export default auth()
	.get(async (req, res) => {
		const member = await getProjectTeamMember(req.query.teamId as string);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Team member successfully!',
			data: member,
		});
	})
	.put(async (req, res) => {
		const data: {
			employeeId: string;
			isLeader?: boolean;
		} = await projectTeamMemberUpdateSchema.validateAsync({ ...req.body });

		const member = await prisma.projectTeam.update({
			where: { id: req.query.teamId as string },
			data,
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Team member updated successfully!',
			data: member,
		});
	})
	.delete(async (req, res) => {
		// Find the team member
		const member = await prisma.projectTeam.findUnique({
			where: { id: req.query.teamId as string },
		});

		if (!member) {
			return res.status(404).json({
				status: 'error',
				message: 'Team member with specified ID was not found!',
			});
		}

		// Delete/Remove the team member
		await prisma.projectTeam.delete({
			where: { id: req.query.teamId as string },
		});

		// Delete/Remove all task following associated with the team member
		await prisma.projectTaskFollower.deleteMany({
			where: {
				employeeId: member.employeeId,
				task: {
					projectId: req.query.id as string,
				},
			},
		});
		return res.status(200).json({
			status: 'success',
			message: 'Team member deleted successfully!',
		});
	});
