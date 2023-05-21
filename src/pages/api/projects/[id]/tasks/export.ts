import {
	projectTaskHeaders as headers,
	projectTaskFollowerHeaders as followerHeaders,
	permissions,
} from '../../../../../config';
import { getProjectTasks } from '../../../../../db';
import {
	createNotification,
	exportData,
	getObjectPermissionExportData,
	getRecords,
	hasViewPermission,
} from '../../../../../db/utils';
import { admin } from '../../../../../middlewares';
import {
	NextApiRequestExtendUser,
	ProjectTaskFollowerImportQueryType,
	UserType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import { handlePrismaErrors } from '../../../../../validators';

async function getTasksData(req: NextApiRequestExtendUser) {
	const placeholder = {
		total: 0,
		result: [],
		project: {
			id: req.query.id as string,
			name: '',
		},
		ongoing: 0,
		completed: 0,
	};
	const result = await getRecords({
		model: 'projects_tasks',
		perm: 'projecttask',
		user: req.user,
		query: req.query,
		placeholder,
		getData(params) {
			return getProjectTasks({
				...params,
				id: req.query.id as string,
			});
		},
	});

	const data = result ? result.data : placeholder;
	const tasks = data.result.map((task) => ({
		id: task.id,
		name: task.name,
		description: task.description,
		due_date: task.dueDate,
		completed: task.completed,
		priority: task.priority,
		project_id: task.project.id,
		updated_at: task.updatedAt,
		created_at: task.createdAt,
	}));
	const perms = await getObjectPermissionExportData({
		ids: tasks.map((task) => task.id),
		model: 'projects_tasks',
	});
	const followers = data.result.reduce(
		(acc: ProjectTaskFollowerImportQueryType[], task) => {
			const taskFollowers = task.followers.map((follower) => ({
				id: follower.id,
				is_leader: follower.isLeader,
				member_id: follower.member.id,
				task_id: task.id,
				created_at: follower.createdAt,
				updated_at: follower.updatedAt,
			}));
			return [...acc, ...taskFollowers];
		},
		[]
	);

	return {
		data: tasks,
		followers,
		permissions: perms,
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
		next();
	})
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EXPORT,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		getTasksData(req)
			// Destructure the followers and export the tasks first
			.then(({ followers, ...data }) =>
				exportData(data, headers, {
					type: (req.query.type as string) || 'csv',
					userId: req.user.id,
				})
					// Pass along the task data export and the followers to the next .then method
					.then((data) => ({ data, followers }))
			)
			// Create a success notification for the task export data and return an exportData function for the
			// task followers to be exported as well
			.then(({ followers, data }) => {
				let message =
					'File exported successfully. The task followers will be exported shortly. Click on the download link to proceed!';
				if (data.size) {
					const size = String(data.size / (1024 * 1024));
					const sizeString =
						size.split('.')[0] + '.' + size.split('.')[1].slice(0, 2);
					message = `File (${sizeString}MB) exported successfully. The task followers will be exported shortly. Click on the download link to proceed!`;
				}
				createNotification({
					message,
					messageId: data.file,
					recipient: req.user.id,
					title: 'Tasks data export was successful.',
					type: 'DOWNLOAD',
				});
				return exportData({ data: followers }, followerHeaders, {
					type: (req.query.type as string) || 'csv',
					userId: req.user.id,
				});
			})
			// create a notification for the successful export of the task followers
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
					title: 'All task followers have exported successfully',
					type: 'DOWNLOAD',
				});
			})
			.catch((err) => {
				const error = handlePrismaErrors(err);
				createNotification({
					message: error.message,
					recipient: req.user.id,
					title: 'Tasks/followers data export failed.',
					type: 'ERROR',
				});
			});

		return res.status(200).json({
			status: 'success',
			message:
				'Your request was received successfully. A notification will be sent to you with a download link.',
		});
	});
