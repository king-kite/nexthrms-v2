import { clientHeaders as headers, permissions } from '../../../config';
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
	ClientImportQueryType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';
import { ObjectPermissionImportType } from '../../../types';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getInput(data: ClientImportQueryType) {
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		company: data.company,
		position: data.position,
		contactId: data.contact_id,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: ClientImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
			contact: {
				id: string;
			} | null;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getInput);
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.client.upsert({
						where: {
							contactId: data.contactId,
						},
						update: data,
						create: data,
						select: {
							id: true,
							contact: {
								select: {
									id: true,
								},
							},
						},
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'clients',
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
		hasModelPermission(req.user.allPermissions, [permissions.client.CREATE]);

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

	importData<ClientImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Clients data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Client Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Client Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
