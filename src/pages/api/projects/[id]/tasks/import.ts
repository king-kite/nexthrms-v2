import {
	projectTaskHeaders as headers,
	projectTaskFollowerHeaders as followerHeaders,
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
} from '../../../../../db/utils';
import { admin } from '../../../../../middlewares';
import {
	ObjectPermissionImportType,
	ProjectTaskImportQueryType,
	ProjectTaskFollowerImportQueryType,
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

function getDataInput(data: ProjectTaskImportQueryType) {
	return {
		projectId: data.project_id,
		id: data.id ? data.id : undefined,
		name: data.name,
		description: data.description,
		completed: data.completed
			? data.completed.toString().toLowerCase() === 'true'
			: false,
		dueDate: new Date(data.due_date),
		priority: data.priority,
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
	};
}

function getFollowerInput(data: ProjectTaskFollowerImportQueryType) {
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
	data: any,
	perms?: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			// Not trying to import followers but tasks data
			if (req.query.import !== 'followers') {
				const input = data.map(getDataInput);
				const result = await prisma.$transaction(
					input.map((data: any) =>
						prisma.projectTask.upsert({
							where: {
								id: data.id,
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
				await Promise.all(
					result.map((task) =>
						addObjectPermissions({
							model: 'projects_tasks',
							objectId: task.id,
							users: [req.user.id],
						})
					)
				);
				if (perms) await importPermissions(perms);
				resolve(result);
			} else {
				const input = data.map(getFollowerInput);
				const result = await prisma.$transaction(
					input.map((data: any) =>
						prisma.projectTaskFollower.upsert({
							where: {
								taskId_memberId: {
									taskId: data.taskId,
									memberId: data.memberId,
								},
							},
							update: data,
							create: data,
						})
					)
				);
				resolve(result);
			}
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
		const hasCreatePerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.projecttask.CREATE,
			]);

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
			req.query.import === 'followers' ? 'Task Followers' : 'Tasks';

		importData<ProjectTaskImportQueryType>({
			headers: req.query.import === 'followers' ? followerHeaders : headers,
			path: files.data.filepath,
			type: files.data.mimetype,
			replaceEmpty: true,
			replaceEmptyValue: null,
		})
			.then((result) => createData(req, result.data, result.permissions))
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
