import { permissions } from '../../../../config';
import {
	getLeavesAdmin,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import {
	addObjectPermissions,
	getRecords,
	updateObjectPermissions,
} from '../../../../db/utils';
import { admin, employee } from '../../../../middlewares';
import {
	CreateLeaveQueryType,
	GetLeavesResponseType,
	LeaveType,
} from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { leaveCreateSchema } from '../../../../validators';

export default admin()
	.get(async (req, res) => {
		const result = await getRecords<GetLeavesResponseType['data']>({
			model: 'leaves',
			perm: 'leave',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				approved: 0,
				denied: 0,
				pending: 0,
				result: [],
			},
			getData(params) {
				return getLeavesAdmin(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.use(employee)
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.leave.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: CreateLeaveQueryType = await leaveCreateSchema.validateAsync({
			...req.body,
		});

		if (!data.employee) {
			return res.status(400).json({
				status: 'error',
				message: 'Employee ID is required',
			});
		}

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
						id: data.employee,
					},
				},
				createdBy: {
					connect: {
						id: req.user.employee?.id,
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
					// Get the employee's supervisors
					{
						isAdmin: true,
						employee: {
							supervisedEmployees: {
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
			users: [req.user.id, leave.employee.user.id],
		});
		// add the admin officers for the user to edit and view
		await updateObjectPermissions({
			model: 'leaves',
			permissions: ['VIEW'],
			objectId: leave.id,
			users: officers.map((officer) => officer.id),
		});

		return res.status(201).json({
			status: 'success',
			mesage: 'Leave was created successfully!',
			data: leave,
		});
	});
