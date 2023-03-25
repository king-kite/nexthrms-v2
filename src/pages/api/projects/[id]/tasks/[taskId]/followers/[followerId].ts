import { permissions } from '../../../../../../../config';
import {
	prisma,
	getTaskFollower,
	taskFollowerSelectQuery as selectQuery,
} from '../../../../../../../db';
import {
	getRecord,
	getUserObjectPermissions,
	hasViewPermission,
	removeObjectPermissions,
} from '../../../../../../../db/utils';
import { auth } from '../../../../../../../middlewares';
import { ProjectTaskType } from '../../../../../../../types';
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
		const record = await getRecord({
			model: 'projects_tasks_followers',
			perm: 'projecttaskfollower',
			permission: 'VIEW',
			objectId: req.query.followerId as string,
			user: req.user,
			getData() {
				return getTaskFollower(req.query.followerId as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data) {
			return res.status(404).json({
				status: 'error',
				message: 'Task follower with the specified ID does not exist!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched task follower successfully!',
			data: record.data,
		});
	})
	.put(async (req, res) => {
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
				permissions.projecttaskfollower.DELETE,
			]);

		if (!hasPerm) {
			const perm = await getUserObjectPermissions({
				modelName: 'projects_tasks_followers',
				permission: 'DELETE',
				objectId: req.query.followerId as string,
				userId: req.user.id,
			});
			hasPerm = perm.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.projectTaskFollower.delete({
			where: { id: req.query.followerId as string },
		});
		return res.status(200).json({
			status: 'success',
			message: 'Task Follower was deleted successfully!',
		});
	});
