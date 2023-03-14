import { permissions } from '../../../../config';
import {
	getLeaves,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import {
	addObjectPermissions,
	getUserObjects,
	updateObjectPermissions,
} from '../../../../db/utils';
import { employee } from '../../../../middlewares';
import { CreateLeaveQueryType, LeaveType } from '../../../../types';
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

		const leave = (await prisma.leave.create({
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
		})) as unknown as LeaveType;

		// Get the employees admin related officers
		const officers = await prisma.user.findMany({
			where: {
				isActive: true,
				OR: [
					// Super users
					{
						isSuperUser: true,
					},
					// Get the employee's supervisor
					{
						isAdmin: true,
						employee: {
							employees: {
								some: {
									id: { in: [leave.employee.id] },
								},
							},
						},
					},
					// Get the employee's department HOD
					{
						isAdmin: true,
						employee: leave.employee.department
							? {
									hod: {
										name: leave.employee.department.name,
									},
							  }
							: undefined,
					},
				],
			},
			select: { id: true },
		});

		await addObjectPermissions({
			model: 'leaves',
			objectId: leave.id,
			users: [req.user.id],
		});

		// add the admin officers for the user to edit and view
		await updateObjectPermissions({
			model: 'leaves',
			permissions: ['VIEW', 'EDIT'],
			objectId: leave.id,
			users: officers.map((officer) => officer.id),
		});

		return res.status(201).json({
			status: 'success',
			mesage: 'Request for a leave was successful!',
			data: leave,
		});
	});
