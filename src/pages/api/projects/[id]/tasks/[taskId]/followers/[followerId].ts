import {
	prisma,
	getTaskFollower,
	taskSelectQuery as selectQuery,
} from '../../../../../../../db';
import { auth } from '../../../../../../../middlewares';
import { projectTeamMemberUpdateSchema } from '../../../../../../../validators';

export default auth()
	.get(async (req, res) => {
		const follower = await getTaskFollower(req.query.followerId as string);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Task Follower successfully!',
			data: follower,
		});
	})
	.put(async (req, res) => {
		const data: {
			employeeId: string;
			isLeader?: boolean;
		} = await projectTeamMemberUpdateSchema.validateAsync({ ...req.body });

		const follower = await prisma.projectTaskFollower.update({
			where: { id: req.query.followerId as string },
			data,
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Task Follower was updated successfully!',
			data: follower,
		});
	})
	.delete(async (req, res) => {
		await prisma.projectTaskFollower.delete({
			where: { id: req.query.followerId as string },
		});
		return res.status(200).json({
			status: 'success',
			message: 'Task Follower was deleted successfully!',
		});
	});
