import {
	getLeaves,
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
		const leaves = await getLeaves({ ...params, id: req.user.employee.id });

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
				message: 'Only employees can request leaves',
			});
		}

		const data: CreateLeaveQueryType = await leaveCreateSchema.validateAsync({
			...req.body,
		});

		// TODO: Check if the user has an approved/pending leave

		const leave = await prisma.leave.create({
			data: {
				...data,
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
