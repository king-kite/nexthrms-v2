import { holidayHeaders as headers, permissions } from '../../../config';
import { prisma } from '../../../db';
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
	HolidayImportQueryType,
	ObjectPermissionImportType,
	NextApiRequestExtendUser,
} from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import parseForm from '../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getDataInput(data: HolidayImportQueryType) {
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		name: data.name,
		date: new Date(data.date),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: HolidayImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise<
		{
			id: string;
		}[]
	>(async (resolve, reject) => {
		try {
			const input = data.map(getDataInput);
			// check that every holiday input has an ID.
			const invalid = input.filter((holiday) => !holiday.id);
			if (invalid.length > 0) {
				return reject({
					data: {
						message:
							`An id field is required to avoid duplicate records. The following records do not have an id: ` +
							input.map((holiday) => holiday.name).join(','),
						title: 'ID field is required.',
					},
					status: 400,
				});
			}
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.department.upsert({
						where: { id: data.id },
						update: data,
						create: data,
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'holiday',
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
			hasModelPermission(req.user.allPermissions, [permissions.holiday.CREATE]);

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

		importData<HolidayImportQueryType>({
			headers,
			path: files.data.filepath,
			type: files.data.mimetype,
		})
			.then((result) => createData(req, result.data, result.permissions))
			.then(() =>
				createNotification({
					message: 'Holiday data was imported successfully.',
					recipient: req.user.id,
					title: 'Import Holiday Data Success.',
					type: 'SUCCESS',
				})
			)
			.catch((error) =>
				handleErrors(error, {
					recipient: req.user.id,
					title: 'Import Holiday Data Error',
				})
			);

		return res.status(200).json({
			status: 'success',
			message:
				'Import file was received successfully. ' +
				'A notification will be sent to you when the task is completed',
		});
	});
