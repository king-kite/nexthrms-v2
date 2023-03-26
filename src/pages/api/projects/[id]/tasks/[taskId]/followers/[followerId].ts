import { permissions } from '../../../../../../../config';
import {
	prisma,
	getTaskFollower,
	taskFollowerSelectQuery as selectQuery,
} from '../../../../../../../db';
import {
	hasObjectPermission,
	hasViewPermission,
} from '../../../../../../../db/utils';
import { auth } from '../../../../../../../middlewares';
import { hasModelPermission } from '../../../../../../../utils';
import { NextApiErrorMessage } from '../../../../../../../utils/classes';
import { projectTaskFollowerUpdateSchema } from '../../../../../../../validators';

export default auth()
	.use(async (req, res, next) => {
		// Check the user can view the project
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextApiErrorMessage(403);

		// Check the user can view the project
		const canViewTask = await hasViewPermission({
			model: 'projects_tasks',
			perm: 'projecttask',
			objectId: req.query.taskId as string,
			user: req.user,
		});
		if (!canViewTask) throw new NextApiErrorMessage(403);
		next();
	})
	.get(async (req, res) => {
		const data = await getTaskFollower(req.query.followerId as string);

		if (data) {
			return res.status(404).json({
				status: 'error',
				message: 'Task follower with the specified ID does not exist!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched task follower successfully!',
			data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EDIT,
			]);
		if (!hasPerm) {
			hasPerm = await hasObjectPermission({
				model: 'projects_tasks',
				permission: 'EDIT',
				objectId: req.query.taskId as string,
				userId: req.user.id,
			});
		}

		if (!hasPerm) throw new NextApiErrorMessage();

		const data: {
			memberId: string;
			isLeader?: boolean;
		} = await projectTaskFollowerUpdateSchema.validateAsync({ ...req.body });

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
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EDIT,
			]);
		if (!hasPerm) {
			hasPerm = await hasObjectPermission({
				model: 'projects_tasks',
				permission: 'EDIT',
				objectId: req.query.taskId as string,
				userId: req.user.id,
			});
		}

		if (!hasPerm) throw new NextApiErrorMessage();

		await prisma.projectTaskFollower.delete({
			where: { id: req.query.followerId as string },
		});
		return res.status(200).json({
			status: 'success',
			message: 'Task Follower was deleted successfully!',
		});
	});
