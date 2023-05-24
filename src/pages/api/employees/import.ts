import { employeeHeaders as headers, permissions } from '../../../config';
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
	EmployeeImportQueryType,
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

function getInput(data: EmployeeImportQueryType) {
	return {
		id: data.id && data.id.length > 0 ? data.id : undefined,
		department: data.department
			? {
					connect: {
						name: data.department,
					},
			  }
			: undefined,
		hod: data.is_hod
			? {
					connect: {
						name: data.is_hod,
					},
			  }
			: undefined,
		job: data.department
			? {
					connect: {
						name: data.job,
					},
			  }
			: undefined,
		userId: data.user_id,
		user: {
			connect: {
				id: data.user_id,
			},
		},
		dateEmployed: data.date_employed
			? new Date(data.date_employed)
			: new Date(),
		updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
		createdAt: data.created_at ? new Date(data.created_at) : new Date(),
	};
}

function createData(
	req: NextApiRequestExtendUser,
	data: EmployeeImportQueryType[],
	perms?: ObjectPermissionImportType[]
) {
	return new Promise(async (resolve, reject) => {
		try {
			const input = data.map(getInput);
			// Arrange the supervisors, coz the supervisor(employee) may not have been created yet
			const supervisors = data.reduce(
				(acc: { supervisors: string[]; userId: string }[], value) => {
					return [
						...acc,
						{
							supervisors: value.supervisors
								? value.supervisors.split(',')
								: [],
							userId: value.user_id,
						},
					];
				},
				[]
			);
			const result = await prisma.$transaction(
				input.map(({ userId, ...data }) =>
					prisma.employee.upsert({
						where: { userId },
						update: data,
						create: data,
						select: {
							id: true,
							user: {
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
						model: 'employees',
						objectId: data.id,
						users: [req.user.id],
					})
				)
			);

			// Now add the supervisors
			await prisma.$transaction(
				supervisors.map(({ supervisors, userId }) =>
					prisma.employee.update({
						where: { userId },
						data: {
							supervisors: {
								connect: supervisors.map((id) => ({ id })),
							},
						},
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
		hasModelPermission(req.user.allPermissions, [permissions.employee.CREATE]);

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

	importData<EmployeeImportQueryType>({
		headers,
		path: files.data.filepath,
		type: files.data.mimetype,
	})
		.then((result) => createData(req, result.data, result.permissions))
		.then(() =>
			createNotification({
				message: 'Employees data was imported successfully.',
				recipient: req.user.id,
				title: 'Import Employee Data Success.',
				type: 'SUCCESS',
			})
		)
		.catch((error) =>
			handleErrors(error, {
				recipient: req.user.id,
				title: 'Import Employee Data Error',
			})
		);

	return res.status(200).json({
		status: 'success',
		message:
			'Import file was received successfully. ' +
			'A notification will be sent to you when the task is completed',
	});
});
