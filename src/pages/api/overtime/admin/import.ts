import { overtimeHeaders as headers, permissions } from '../../../../config';
import { importOvertime } from '../../../../db/queries/overtime';
import {
	addObjectPermissions,
	createNotification,
	handleNotificationErrors as handleErrors,
	importData,
	importPermissions,
	updateObjectPermissions,
} from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import {
	OvertimeImportQueryType,
	ObjectPermissionImportType,
	NextApiRequestExtendUser,
} from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../utils/classes';
import parseForm from '../../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function createData(
	req: NextApiRequestExtendUser,
	data: OvertimeImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise(async (resolve, reject) => {
		try {
			const result = await importOvertime(data);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'overtime',
						objectId: data.id,
						users: [req.user.id, data.employee.user.id],
					})
				)
			);
			if (perms) await importPermissions(perms);
			else {
				// Let supervisors and hod view and edit
				await Promise.all(
					result.map((data) => {
						const users = [];
						if (data.employee.department?.hod)
							users.push(data.employee.department.hod.user.id);
						data.employee.supervisors.forEach((supervisor) => {
							users.push(supervisor.user.id);
						});
						return updateObjectPermissions({
							model: 'overtime',
							permissions: ['VIEW', 'EDIT'],
							objectId: data.id,
							users,
						});
					})
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
		hasModelPermission(req.user.allPermissions, [permissions.overtime.CREATE]);

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

	importData<OvertimeImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Overtime data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Leave Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Overtime Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
