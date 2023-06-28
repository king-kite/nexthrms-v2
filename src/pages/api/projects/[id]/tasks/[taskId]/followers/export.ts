import {
	projectTaskFollowerHeaders as headers,
	permissions,
} from '../../../../../../../config';
import { getTaskFollowers } from '../../../../../../../db/queries/projects';
import {
	createNotification,
	exportData,
	hasViewPermission,
} from '../../../../../../../db/utils';
import { admin } from '../../../../../../../middlewares';
import { NextApiRequestExtendUser } from '../../../../../../../types';
import { hasModelPermission } from '../../../../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../../../../utils/classes';
import {
	handlePrismaErrors,
	validateParams,
} from '../../../../../../../validators';

async function getData(req: NextApiRequestExtendUser) {
	const params = validateParams({ ...req.query });
	const data = await getTaskFollowers({
		...params,
		id: req.query.taskId as string,
	});

	const followers = data.result.map((follower) => ({
		id: follower.id,
		is_leader: follower.isLeader,
		member_id: follower.member.id,
		task_id: req.query.taskId as string,
		created_at: follower.createdAt,
		updated_at: follower.updatedAt,
	}));

	return {
		data: followers,
	};
}

export default admin()
	.use(async (req, res, next) => {
		// Check the user can view the project
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextApiErrorMessage(403);

		// Check the user can view the task
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
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EXPORT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		getData(req)
			.then((data) => {
				return exportData(data, headers, {
					title: 'task followers',
					type: (req.query.type as string) || 'csv',
					userId: req.user.id,
				});
			})
			.then((data) => {
				let message =
					'File exported successfully. Click on the download link to proceed!';
				if (data.size) {
					const size = String(data.size / (1024 * 1024));
					const sizeString =
						size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
					message = `File (${sizeString}MB) exported successfully. Click on the download link to proceed!`;
				}
				createNotification({
					message,
					messageId: data.file,
					recipient: req.user.id,
					title: 'Task followers data export was successful.',
					type: 'DOWNLOAD',
				});
			})
			.catch((err) => {
				const error = handlePrismaErrors(err);
				createNotification({
					message: error.message,
					recipient: req.user.id,
					title: 'Task followers data export failed.',
					type: 'ERROR',
				});
			});

		return res.status(200).json({
			status: 'success',
			message:
				'Your request was received successfully. A notification will be sent to you with a download link.',
		});
	});
