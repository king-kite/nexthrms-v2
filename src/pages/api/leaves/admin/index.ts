import {
	getLeavesAdmin,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { leaveCreateSchema, validateParams } from '../../../../validators';
import { CreateLeaveQueryType } from '../../../../types';

export default auth()
	.get(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can request leaves',
			});
		}

		const params = validateParams(req.query);
		const leaves = await getLeavesAdmin({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leaves successfully',
			data: leaves,
		});
	})
	.post(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can create leaves',
			});
		}

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
						id: data.employee,
					},
				},
				createdBy: {
					connect: {
						id: req.user.employee.id
					}
				}
			},
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			mesage: 'Leave was created successfully!',
			data: leave,
		});
	});
