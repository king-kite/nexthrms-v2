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
import { hasModelPermission } from '../../../utils/permission';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin().post(async (req, res) => {
	const queryImport = req.query.import?.toString() || 'projects';

	// Can create project
	const hasCreatePerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.project.CREATE]);
	if (!hasCreatePerm && queryImport === 'projects')
		throw new NextErrorMessage(403);

	// Can create task
	const hasTaskCreatePerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.projecttask.CREATE,
		]);
	if (!hasTaskCreatePerm && queryImport === 'tasks')
		throw new NextErrorMessage(403);

	// Can edit project
	// Only allow model level user permissions
	const hasEditPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.project.EDIT]);
	if (!hasEditPerm && !hasCreatePerm && queryImport === 'team')
		throw new NextErrorMessage(403);

	// Can create file
	const hasFileCreatePerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.projectfile.CREATE,
		]);
	if (!hasFileCreatePerm && queryImport === 'files')
		throw new NextErrorMessage(403);

	// Can edit project task
	// Only allow model level user permissions
	const hasTaskEditPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.projecttask.EDIT]);
	if (!hasTaskEditPerm && !hasTaskCreatePerm && queryImport === 'followers')
		throw new NextErrorMessage(403);

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
		queryImport === 'files'
			? 'Project Files'
			: queryImport === 'team'
			? 'Project Team'
			: queryImport === 'tasks'
			? 'Tasks'
			: queryImport === 'followers'
			? 'Task Followers'
			: 'Projects';

	importData({
		headers:
			queryImport === 'files'
				? fileHeaders
				: queryImport === 'team'
				? teamHeaders
				: queryImport === 'tasks'
				? taskHeaders
				: queryImport === 'followers'
				? followerHeaders
				: headers,
		path: files.data.filepath,
		type: files.data.mimetype,
		replaceEmpty: true,
		replaceEmptyValue: null,
	})
		.then((result) =>
			queryImport === 'files'
				? importProjectFiles({
						data: result.data as ProjectFileImportQueryType[],
						permissions: result.permissions,
						userId: req.user.id,
				  })
				: queryImport === 'team'
				? importProjectTeam({
						data: result.data as ProjectTeamImportQueryType[],
				  })
				: queryImport === 'tasks'
				? importProjectTasks({
						data: result.data as ProjectTaskImportQueryType[],
						permissions: result.permissions,
						userId: req.user.id,
				  })
				: queryImport === 'followers'
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
