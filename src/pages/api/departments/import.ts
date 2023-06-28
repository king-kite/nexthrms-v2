import { departmentHeaders as headers, permissions } from '../../../config';
import prisma from '../../../db/client';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	DepartmentImportQueryType,
	ObjectPermissionImportType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getDataInput(data: DepartmentImportQueryType) {
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		name: data.name,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: DepartmentImportQueryType[],
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
					prisma.department.upsert({
						where: data.id
							? {
									id: data.id,
							  }
							: {
									name: data.name,
							  },
						update: data,
						create: data,
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'departments',
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

export default admin().post(async (req, res) => {
	const hasExportPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [
			permissions.department.CREATE,
		]);

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

	importData<DepartmentImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Departments data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Department Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Department Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
