import {
	projectHeaders as headers,
	projectFileHeaders as fileHeaders,
	projectTeamHeaders as teamHeaders,
	projectTaskHeaders as taskHeaders,
	projectTaskFollowerHeaders as followerHeaders,
	permissions,
} from '../../../config';
import {
	createNotification,
	handleNotificationErrors as handleErrors,
	hasViewPermission,
	importData,
} from '../../../db/utils';
import {
	importProjects,
	importProjectFiles,
	importProjectTeam,
	importProjectTasks,
	importProjectTaskFollowers,
} from '../../../db/utils/projects';
import { admin } from '../../../middlewares';
import {
	ProjectImportQueryType,
	ProjectFileImportQueryType,
	ProjectTeamImportQueryType,
	ProjectTaskImportQueryType,
	ProjectTaskFollowerImportQueryType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin().post(async (req, res) => {
	const hasCreatePerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.project.CREATE]);

	if (!hasCreatePerm) throw new NextApiErrorMessage(403);

	const { files } = (await parseForm(req)) as { files: any };

	if (!files.data)
		throw new NextApiErrorMessage(400, 'Data field is required!');

	if (
		files.data.mimetype !== 'text/csv' &&
		files.data.mimetype !== 'application/zip' &&
		files.data.mimetype !==
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	)
		throw new NextApiErrorMessage(
			400,
			'Sorry, only CSVs, Microsoft excel files and Zip files are allowed!'
		);

	const messageTitle =
		req.query.import === 'files'
			? 'Project Files'
			: req.query.import === 'team'
			? 'Project Team'
			: req.query.import === 'tasks'
			? 'Tasks'
			: req.query.import === 'followers'
			? 'Task Followers'
			: 'Projects';

	importData({
		headers:
			req.query.import === 'files'
				? fileHeaders
				: req.query.import === 'team'
				? teamHeaders
				: req.query.import === 'tasks'
				? taskHeaders
				: req.query.import === 'followers'
				? followerHeaders
				: headers,
		path: files.data.filepath,
		type: files.data.mimetype,
		replaceEmpty: true,
		replaceEmptyValue: null,
	})
		.then((result) =>
			req.query.import === 'files'
				? importProjectFiles({
						data: result.data as ProjectFileImportQueryType[],
						permissions: result.permissions,
						userId: req.user.id,
				  })
				: req.query.import === 'team'
				? importProjectTeam({
						data: result.data as ProjectTeamImportQueryType[],
				  })
				: req.query.import === 'tasks'
				? importProjectTasks({
						data: result.data as ProjectTaskImportQueryType[],
						permissions: result.permissions,
						userId: req.user.id,
				  })
				: req.query.import === 'followers'
				? importProjectTaskFollowers({
						data: result.data as ProjectTaskFollowerImportQueryType[],
				  })
				: importProjects({
						data: result.data as ProjectImportQueryType[],
						permissions: result.permissions,
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
