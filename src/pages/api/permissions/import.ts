import { permissionHeaders as headers, permissions } from '../../../config';
import prisma from '../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { employeeMiddleware as employee } from '../../../middlewares/api';
import {
	PermissionImportQueryType,
	ObjectPermissionImportType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getDataInput(data: PermissionImportQueryType) {
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		codename: data.codename,
		name: data.name,
		description: data.description || null,
		category: data.category
			? {
					connectOrCreate: {
						where: {
							name: data.category,
						},
						create: {
							name: data.category,
						},
					},
			  }
			: undefined,
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: PermissionImportQueryType[],
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
					prisma.permission.upsert({
						where: { codename: data.codename },
						update: data,
						create: data,
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'permissions',
						objectId: data.id,
						users: [req.user.id],
					})
				)
			);
			if (perms) await importPermissions(perms);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

export default admin()
	.use(employee)
	.post(async (req, res) => {
		const hasExportPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.permission.EDIT,
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

		importData<PermissionImportQueryType>({
			headers,
			path: files.data.filepath,
			type: files.data.mimetype,
		})
			.then((result) => createData(req, result.data, result.permissions))
			.then(() =>
				createNotification({
					message: 'Permission data was imported successfully.',
					recipient: req.user.id,
					title: 'Import Permission Data Success.',
					type: 'SUCCESS',
				})
			)
			.catch((error) =>
				handleErrors(error, {
					recipient: req.user.id,
					title: 'Import Permission Data Error',
				})
			);

		return res.status(200).json({
			status: 'success',
			message:
				'Import file was received successfully. ' +
				'A notification will be sent to you when the task is completed',
		});
	});
