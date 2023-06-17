import { managedFileHeaders as headers, permissions } from '../../../config';
import { prisma } from '../../../db';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import {
	ManagedFileImportQueryType,
	ObjectPermissionImportType,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getManagedFileInput(data: ManagedFileImportQueryType) {
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
		type: data.type,
		name: data.name,
		url: data.url,
		size: +data.size,
		storageInfo,
		user: data.user_id
			? {
					connect: {
						id: data.user_id,
					},
			  }
			: undefined,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

export function importManagedFiles({
	data,
	permissions: perms,
	userId,
}: {
	data: ManagedFileImportQueryType[];
	permissions?: ObjectPermissionImportType[];
	userId: string;
}) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getManagedFileInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.managedFile.upsert({
						where: { id: data.id },
						update: data,
						create: data,
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'managed_files',
						objectId: data.id,
						users: [userId],
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
			permissions.managedfile.CREATE,
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

	importData<ManagedFileImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) =>
			importManagedFiles({
				data: result.data,
				permissions: result.permissions,
				userId: req.user.id,
			})
		)
		.then(() =>
			createNotification({
				message: 'File manager data was imported successfully.',
				recipient: req.user.id,
				title: 'Import File Manager Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import File Manager Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
