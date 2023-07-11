import {
	projectTaskHeaders as headers,
	projectTaskFollowerHeaders as followerHeaders,
	permissions,
} from '../../../../../config';
import {
	createNotification,
	handleNotificationErrors as handleErrors,
	hasViewPermission,
	importData,
} from '../../../../../db/utils';
import {
	importProjectTasks,
	importProjectTaskFollowers,
} from '../../../../../db/utils/projects';
import { admin } from '../../../../../middlewares';
import {
	ProjectTaskImportQueryType,
	ProjectTaskFollowerImportQueryType,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils/permission';
import { NextErrorMessage } from '../../../../../utils/classes';
import parseForm from '../../../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.use(async (req, res, next) => {
		// Check the user can view the project
		const canViewProject = await hasViewPermission({
			model: 'projects',
			perm: 'project',
			objectId: req.query.id as string,
			user: req.user,
		});
		if (!canViewProject) throw new NextErrorMessage(403);
		next();
	})
	.post(async (req, res) => {
		const hasCreatePerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.CREATE,
			]);

		if (!hasCreatePerm) throw new NextErrorMessage(403);

		const { files } = (await parseForm(req)) as { files: any };

		if (!files.data) throw new NextErrorMessage(400, 'Data field is required!');

		if (
			files.data.mimetype !== 'text/csv' &&
			files.data.mimetype !== 'application/zip' &&
			files.data.mimetype !==
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		)
			throw new NextErrorMessage(
				400,
				'Sorry, only CSVs, Microsoft excel files and Zip files are allowed!'
			);

		const messageTitle =
			req.query.import === 'followers' ? 'Task Followers' : 'Tasks';

		importData({
			headers: req.query.import === 'followers' ? followerHeaders : headers,
			path: files.data.filepath,
			type: files.data.mimetype,
			replaceEmpty: true,
			replaceEmptyValue: null,
		})
			.then((result) =>
				req.query.import === 'followers'
					? importProjectTaskFollowers({
							data: result.data as ProjectTaskFollowerImportQueryType[],
					  })
					: importProjectTasks({
							data: result.data as ProjectTaskImportQueryType[],
							permissions: result.permissions,
							projectId: req.query.id as string,
							userId: req.user.id,
					  })
			)
			.then(() =>
				createNotification({
					message: `${messageTitle} data was imported successfully.`,
					recipient: req.user.id,
					title: `Import ${messageTitle} Data Success.`,
					type: 'SUCCESS',
				})
			)
			.catch((error) =>
				handleErrors(error, {
					recipient: req.user.id,
					title: `Import ${messageTitle} Data Error`,
				})
			);

		return res.status(200).json({
			status: 'success',
			message:
				'Import file was received successfully. ' +
				'A notification will be sent to you when the task is completed',
		});
	});
