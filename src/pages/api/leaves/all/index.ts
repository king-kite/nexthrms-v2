import { permissions } from '../../../../config';
import {
	getLeaves,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { employee } from '../../../../middlewares';
import { CreateLeaveQueryType, PermissionType } from '../../../../types';
import { hasPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { getDistinctPermissions } from '../../../../utils/serializers';
import { leaveCreateSchema, validateParams } from '../../../../validators';

export default employee()
	.get(async (req, res) => {
		const userPermissions = getDistinctPermissions([
			...req.user.permissions,
			...req.user.groups.reduce((acc: PermissionType[], group) => {
				return [...acc, ...group.permissions];
			}, []),
		]);

		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(userPermissions, [permissions.leave.VIEW]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const params = validateParams(req.query);
		const leaves = await getLeaves({ ...params, id: req.user.employee.id });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leaves successfully',
			data: leaves,
		});
	})
	.post(async (req, res) => {
		const userPermissions = getDistinctPermissions([
			...req.user.permissions,
			...req.user.groups.reduce((acc: PermissionType[], group) => {
				return [...acc, ...group.permissions];
			}, []),
		]);

		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(userPermissions, [permissions.leave.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: CreateLeaveQueryType = await leaveCreateSchema.validateAsync({
			...req.body,
		});

		// TODO: Check if the user has an approved/pending leave

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

		return res.status(201).json({
			status: 'success',
			mesage: 'Request for a leave was successful!',
			data: leave,
		});
	});
