import {
	projectTeamHeaders as headers,
	permissions,
} from '../../../../../config';
import { prisma } from '../../../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	hasViewPermission,
	importData,
	importPermissions,
	updateObjectPermissions,
} from '../../../../../db/utils';
import { admin } from '../../../../../middlewares';
import {
	ProjectTeamImportQueryType,
	NextApiRequestExtendUser,
} from '../../../../../types';
import { hasModelPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';
import parseForm from '../../../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getDataInput(data: ProjectTeamImportQueryType) {
	return {
		id: data.id ? data.id : undefined,
		isLeader: data.is_leader
			? data.is_leader.toString().toLowerCase() === 'true'
			: false,
		employeeId: data.employee_id,
		projectId: data.project_id,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: ProjectTeamImportQueryType[]
) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getDataInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.projectTeam.upsert({
						where: {
							projectId_employeeId: {
								projectId: req.query.id as string,
								employeeId: data.employeeId,
							},
						},
						update: {
							...data,
							projectId: req.query.id as string,
						},
						create: {
							...data,
							projectId: req.query.id as string,
						},
					})
				)
			);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
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
	.post(async (req, res) => {
		const hasExportPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.project.EDIT]);

		if (!hasExportPerm) throw new NextApiErrorMessage(403);

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
			.then((result) => createData(req, result.data))
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
