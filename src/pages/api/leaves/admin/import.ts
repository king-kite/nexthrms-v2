import { leaveHeaders as headers, permissions } from '../../../../config';
import { prisma } from '../../../../db';
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
	LeaveImportQueryType,
	ObjectPermissionImportType,
	NextApiRequestExtendUser,
} from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import parseForm from '../../../../utils/parseForm';

export const config = {
	api: {
		bodyParser: false,
	},
};

function getDataInput(data: LeaveImportQueryType) {
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		reason: data.reason,
		startDate: new Date(data.start_date),
		endDate: new Date(data.end_date),
		type: data.type,
		status: data.status,
		employeeId: data.employee_id,
		createdById: data.created_by ? data.created_by : null,
		approvedById: data.approved_by ? data.approved_by : null,
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: LeaveImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise(async (resolve, reject) => {
		try {
			const input = data.map(getDataInput);
			// check that every value input has an ID.
			const invalid = input.filter((value) => !value.id);
			if (invalid.length > 0) {
				return reject({
					data: {
						message:
							`An id field is required to avoid duplicate records. The following records do not have an id: ` +
							input
								.map(
									(value) => value.employeeId + ' ' + new Date(value.startDate)
								)
								.join(','),
						title: 'ID field is required.',
					},
					status: 400,
				});
			}
			const result = await prisma.$transaction(
				input.map((data) =>
					prisma.leave.upsert({
						where: { id: data.id },
						update: data,
						create: data,
						select: {
							id: true,
							employee: {
								select: {
									user: {
										select: { id: true },
									},
									department: {
										select: {
											hod: {
												select: {
													user: {
														select: {
															id: true,
														},
													},
												},
											},
										},
									},
									supervisors: {
										select: {
											user: {
												select: {
													id: true,
												},
											},
										},
									},
								},
							},
						},
					})
				)
			);
			await Promise.all(
				result.map((data) =>
					addObjectPermissions({
						model: 'leaves',
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
							model: 'leaves',
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

	importData<LeaveImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Leaves data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Leave Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Leave Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});