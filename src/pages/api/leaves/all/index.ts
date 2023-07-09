import permissions from '../../../../config/permissions';
import prisma from '../../../../db';
import {
	getLeaves,
	leaveSelectQuery as selectQuery,
} from '../../../../db/queries/leaves';
import {
	addObjectPermissions,
	getEmployeeOfficersId,
	getUserObjects,
	updateObjectPermissions,
} from '../../../../db/utils';
import { employee } from '../../../../middlewares';
import { LeaveType } from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { validateParams } from '../../../../validators';
import { leaveCreateSchema } from '../../../../validators/leaves';

export default employee()
	.get(async (req, res) => {
		// If the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName: 'leaves',
			permission: 'VIEW',
			userId: req.user.id,
		});

		const params = validateParams(req.query);

		// Get leaves that only belong this employee and
		// ones he/she can view. The user should be able to view all he creates,
		// unless he is then removed from the view object level permission by a higher user.
		const leaves = await getLeaves({
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
			data: leaves,
		});
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.leave.REQUEST]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await leaveCreateSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false }
		);

		const leave = (await prisma.leave.create({
			data: {
				...data,
				employee: {
					connect: {
						id: req.user.employee.id,
					},
				},
			},
			select: selectQuery,
		})) as unknown as LeaveType;

		// Get the employees admin related officers
		const officers = await getEmployeeOfficersId(leave.employee.id);

		await addObjectPermissions({
			model: 'leaves',
			objectId: leave.id,
			users: [req.user.id],
		});

		// add the admin officers for the user to edit and view
		await updateObjectPermissions({
			model: 'leaves',
			permissions: ['VIEW'],
			objectId: leave.id,
			users: officers.filter((id) => id !== req.user.id),
		});

		return res.status(201).json({
			status: 'success',
			mesage: 'Request for a leave was successful!',
			data: leave,
		});
	});
