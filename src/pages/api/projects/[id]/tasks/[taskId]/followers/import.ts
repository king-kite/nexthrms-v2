import {
	projectTaskFollowerHeaders as headers,
	permissions,
} from '../../../../../../../config';
import { prisma } from '../../../../../../../db';
import {
	createNotification,
	handleNotificationErrors as handleErrors,
	hasViewPermission,
	hasObjectPermission,
	importData,
} from '../../../../../../../db/utils';
import { admin } from '../../../../../../../middlewares';
import {
	ProjectTaskFollowerImportQueryType,
	NextApiRequestExtendUser,
} from '../../../../../../../types';
import { hasModelPermission } from '../../../../../../../utils';
import { NextApiErrorMessage } from '../../../../../../../utils/classes';
import parseForm from '../../../../../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getDataInput(data: ProjectTaskFollowerImportQueryType) {
	return {
		id: data.id ? data.id : undefined,
		isLeader: data.is_leader
			? data.is_leader.toString().toLowerCase() === 'true'
			: false,
		memberId: data.member_id,
		taskId: data.task_id,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: ProjectTaskFollowerImportQueryType[]
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
					prisma.projectTaskFollower.upsert({
						where: {
							taskId_memberId: {
								taskId: req.query.taskId as string,
								memberId: data.memberId,
							},
						},
						update: {
							...data,
							taskId: req.query.taskId as string,
						},
						create: {
							...data,
							taskId: req.query.taskId as string,
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
	.post(async (req, res) => {
		const hasExportPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.EDIT,
			]);

		if (!hasExportPerm) {
			const hasPerm = await hasObjectPermission({
				model: 'projects_tasks',
				objectId: req.query.taskId as string,
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

		importData<ProjectTaskFollowerImportQueryType>({
			headers,
			path: files.data.filepath,
			type: files.data.mimetype,
		})
			.then((result) => createData(req, result.data))
			.then(() =>
				createNotification({
					message: 'Task followers data was imported successfully.',
					recipient: req.user.id,
					title: 'Import Task Followers Data Success.',
					type: 'SUCCESS',
				})
			)
			.catch((error) =>
				handleErrors(error, {
					recipient: req.user.id,
					title: 'Import Task Followers Data Error',
				})
			);

		return res.status(200).json({
			status: 'success',
			message:
				'Import file was received successfully. ' +
				'A notification will be sent to you when the task is completed',
		});
	});
