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
		await prisma.projectTeam.delete({
			where: { id: req.query.teamId as string },
		});
		return res.status(200).json({
			status: 'success',
			message: 'Team member deleted successfully!',
		});
	});
