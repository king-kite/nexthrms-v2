import {
	projectTeamHeaders as headers,
	permissions,
} from '../../../../../config';
import {
	createNotification,
	handleNotificationErrors as handleErrors,
	hasViewPermission,
	hasObjectPermission,
	importData,
} from '../../../../../db/utils';
import { importProjectTeam } from '../../../../../db/utils/projects';
import { admin } from '../../../../../middlewares';
import { ProjectTeamImportQueryType } from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
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
		if (!canViewProject) throw new NextApiErrorMessage(403);
		next();
	})
	.post(async (req, res) => {
		const hasExportPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.project.EDIT]);

		if (!hasExportPerm) {
			const hasPerm = await hasObjectPermission({
				model: 'projects',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (!hasPerm) throw new NextApiErrorMessage(403);
		}

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

		importData<ProjectTeamImportQueryType>({
			headers,
			path: files.data.filepath,
			type: files.data.mimetype,
		})
			.then((result) =>
				importProjectTeam({
					data: result.data,
					projectId: req.query.id as string,
				})
			)
			.then(() =>
				createNotification({
					message: "Project's team data was imported successfully.",
					recipient: req.user.id,
					title: 'Import Project Team Data Success.',
					type: 'SUCCESS',
				})
			)
			.catch((error) =>
				handleErrors(error, {
					recipient: req.user.id,
					title: 'Import Project Team Data Error',
				})
			);

		return res.status(200).json({
			status: 'success',
			message:
				'Import file was received successfully. ' +
				'A notification will be sent to you when the task is completed',
		});
	});
