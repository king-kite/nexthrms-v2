import { permissions } from '../../../../config';
import {
	getLeaves,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { addObjectPermissions, getUserObjects } from '../../../../db/utils';
import { employee } from '../../../../middlewares';
import { CreateLeaveQueryType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { leaveCreateSchema, validateParams } from '../../../../validators';

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
			hasModelPermission(req.user.allPermissions, [permissions.leave.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: CreateLeaveQueryType = await leaveCreateSchema.validateAsync({
			...req.body,
		});

		const startDate = new Date(data.startDate);
		startDate.setHours(0, 0, 0, 0);

		const endDate = new Date(data.endDate);
		endDate.setHours(0, 0, 0, 0);

		const leave = await prisma.leave.create({
			data: {
				...data,
				startDate,
				endDate,
				employee: {
					connect: {
						id: req.user.employee.id,
					},
				},
			},
			select: selectQuery,
		});

		if (leave.id)
			await addObjectPermissions({
				model: 'leaves',
				objectId: leave.id,
				users: [req.user.id],
			});

		return res.status(201).json({
			status: 'success',
			mesage: 'Request for a leave was successful!',
			data: leave,
		});
	});
