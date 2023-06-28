import { groupHeaders as headers, permissions } from '../../../config';
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
	GroupImportQueryType,
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

function getDataInput(group: GroupImportQueryType) {
	return {
		id: group.id && group.id.length > 0 ? group.id : undefined,
		name: group.name,
		description: group.description,
		active: group.active
			? group.active.toString().toLowerCase() === 'true'
			: false,
		permissions: group.permissions ? group.permissions.split(',') : null,
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: GroupImportQueryType[],
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
					prisma.group.upsert({
						where: data.id
							? {
									id: data.id,
							  }
							: {
									name: data.name,
							  },
						update: {
							...data,
							permissions: data.permissions
								? {
										set: data.permissions.map((codename) => ({ codename })),
								  }
								: undefined,
						},
						create: {
							...data,
							permissions: data.permissions
								? {
										connect: data.permissions.map((codename) => ({ codename })),
								  }
								: undefined,
						},
						select: {
							id: true,
						},
					})
				)
			);
			await Promise.all(
				result.map((group) =>
					addObjectPermissions({
						model: 'groups',
						objectId: group.id,
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
		hasModelPermission(req.user.allPermissions, [permissions.group.CREATE]);

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

	importData<GroupImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Groups data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Group Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Group Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
