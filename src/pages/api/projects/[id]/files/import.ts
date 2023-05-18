import {
	projectFileHeaders as headers,
	permissions,
} from '../../../../../config';
import { prisma, getProjectTeam } from '../../../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
	updateObjectPermissions,
} from '../../../../../db/utils';
import { admin } from '../../../../../middlewares';
import {
	ProjectFileImportQueryType,
	ObjectPermissionImportType,
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

function getDataInput(data: ProjectFileImportQueryType) {
	const keys = data.storage_info_keys
		? data.storage_info_keys.split(',')
		: null;
	const values = data.storage_info_values
		? data.storage_info_values.split(',')
		: null;
	const storageInfo =
		keys && values
			? keys.reduce((acc: any, key: string, index) => {
					return {
						...acc,
						[key]: values[index],
					};
			  }, {})
			: null;

	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		projectId: data.project_id,
		name: data.name,
		file: data.file,
		size: +data.size,
		type: data.type,
		storageInfo,
		uploadedBy: data.uploaded_by ? data.uploaded_by : null,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: ProjectFileImportQueryType[],
	perms?: ObjectPermissionImportType[]
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
					prisma.projectFile.upsert({
						where: { id: data.id },
						update: data,
						create: data,
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'projects_files',
						objectId: data.id,
						users: [req.user.id],
					})
				)
			);
			if (perms) await importPermissions(perms);
			else {
				const team = await getProjectTeam({
					id: req.query.id as string,
				});
				const ids = team.result.reduce((acc: string[], team) => {
					if (team.employee.user.id !== req.user.id)
						return [...acc, team.employee.user.id];
					return acc;
				}, []);
				await Promise.all(
					result.map((data) =>
						updateObjectPermissions({
							model: 'projects_files',
							objectId: data.id,
							permissions: ['VIEW'],
							users: ids,
						})
					)
				);
			}
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

export default admin().post(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.user.CREATE]);

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

	importData<ProjectFileImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
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
