import { permissions } from '../../../../config';
import {
	getLeavesAdmin,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { addObjectPermissions, getRecords } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
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
	.post(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Sorry, this request is reserved for employees only.',
			});
		}

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

		// TODO: Check if the user has an approved/pending leave
		// Doesn't really matter now

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
						id: req.user.employee.id,
					},
				},
			},
			select: selectQuery,
		})) as unknown as LeaveType;

		const permPromises = [];
		permPromises.push(
			// creator
			await addObjectPermissions({
				model: 'leaves',
				objectId: leave.id,
				userId: req.user.id,
			}),
			// owner
			await addObjectPermissions({
				model: 'leaves',
				objectId: leave.id,
				userId: leave.employee.user.id,
			})
		);

		await Promise.all(permPromises);

		return res.status(201).json({
			status: 'success',
			mesage: 'Leave was created successfully!',
			data: leave,
		});
	});
