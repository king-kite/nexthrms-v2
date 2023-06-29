import { permissions } from '../../../../config';
import prisma from '../../../../db';
import {
	getAllOvertime,
	overtimeSelectQuery as selectQuery,
} from '../../../../db/queries/overtime';
import {
	addObjectPermissions,
	getEmployeeOfficersId,
	getUserObjects,
	updateObjectPermissions,
} from '../../../../db/utils';
import { employee } from '../../../../middlewares';
import { OvertimeType } from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { validateParams } from '../../../../validators';
import { overtimeCreateSchema } from '../../../../validators/overtime';

export default employee()
	.get(async (req, res) => {
		// If the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName: 'overtime',
			permission: 'VIEW',
			userId: req.user.id,
		});

		const params = validateParams(req.query);

		// Get overtime records that only belong this employee and
		// ones he/she can view. The user should be able to view all he creates,
		// unless he is then removed from the view object level permission by a higher user.
		const overtime = await getAllOvertime({
			...params,
			id: req.user.employee.id,
			where: {
				id: {
					in: userObjects.map((obj) => obj.objectId),
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched data successfully',
			data: overtime,
		});
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.overtime.REQUEST,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await overtimeCreateSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false }
		);

		// TODO: Check if the user has an approved/pending overtime

		const date = new Date(data.date);
		date.setHours(0, 0, 0, 0);

		const overtime = (await prisma.overtime.create({
			data: {
				...data,
				date,
				employee: {
					connect: {
						id: req.user.employee.id,
					},
				},
			},
			select: selectQuery,
		})) as unknown as OvertimeType;

		// Get the employees admin related officers
		const officers = await getEmployeeOfficersId(overtime.employee.id);

		await addObjectPermissions({
			model: 'overtime',
			objectId: overtime.id,
			users: [req.user.id],
		});

		// add the admin officers for the user to edit and view
		await updateObjectPermissions({
			model: 'overtime',
			permissions: ['VIEW'],
			objectId: overtime.id,
			users: officers.filter((id) => id !== req.user.id),
		});

		return res.status(201).json({
			status: 'success',
			mesage: 'Request for overtime was successful!',
			data: overtime,
		});
	});
