import {
	projectFileHeaders as headers,
	permissions,
} from '../../../../../config';
import {
	createNotification,
	handleNotificationErrors as handleErrors,
	hasViewPermission,
	importData,
} from '../../../../../db/utils';
import { importProjectFiles } from '../../../../../db/utils/projects';
import { admin } from '../../../../../middlewares';
import { ProjectFileImportQueryType } from '../../../../../types';
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
		const hasExportPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projectfile.CREATE,
			]);

		if (!hasExportPerm) throw new NextErrorMessage(403);

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

		importData<ProjectFileImportQueryType>({
			headers,
			path: files.data.filepath,
			type: files.data.mimetype,
		})
			.then((result) =>
				importProjectFiles({
					data: result.data,
					permissions: result.permissions,
					projectId: req.query.id as string,
					userId: req.user.id,
				})
			)
			.then(() =>
				createNotification({
					message: "Project's files data was imported successfully.",
					recipient: req.user.id,
					title: 'Import Project File Data Success.',
					type: 'SUCCESS',
				})
			)
			.catch((error) =>
				handleErrors(error, {
					recipient: req.user.id,
					title: 'Import Project File Data Error',
				})
			);

		return res.status(200).json({
			status: 'success',
			message:
				'Import file was received successfully. ' +
				'A notification will be sent to you when the task is completed',
		});
	});
