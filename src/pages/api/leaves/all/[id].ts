import {
	getLeave,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { leaveApprovalSchema, leaveCreateSchema } from '../../../../validators';
import { CreateLeaveQueryType } from '../../../../types';

export default auth()
	.get(async (req, res) => {
		const leave = await getLeave(req.query.id as string);
		// TODO: Check Permissions

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leave successfully!',
			data: leave,
		});
	})
	// .post(async (req, res) => {
	// 	const {
	// 		approval,
	// 	}: {
	// 		approval: 'APPROVED' | 'DENIED';
	// 	} = await leaveApprovalSchema.validateAsync({ ...req.body });
	// 	const leave = await prisma.leave.update({
	// 		where: {
	// 			id: req.query.id as string,
	// 		},
	// 		data: {
	// 			status: approval,
	// 		},
	// 		select: selectQuery,
	// 	});

	// 	return res.status(200).json({
	// 		status: 'success',
	// 		mesage:
	// 			'Leave request was ' +
	// 			(approval === 'DENIED' ? 'denied!' : 'approved!'),
	// 		data: leave,
	// 	});
	// })
	.put(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can request leaves',
			});
		}

		const { employee, ...data }: CreateLeaveQueryType =
			await leaveCreateSchema.validateAsync({
				...req.body,
			});

		// TODO: Check if the user has an approved/pending leave

		const startDate = new Date(data.startDate);
		startDate.setHours(0, 0, 0, 0);

		const endDate = new Date(data.endDate);
		endDate.setHours(0, 0, 0, 0);

		const leave = await prisma.leave.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				...data,
				startDate,
				endDate,
			},
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			mesage: 'Leave request was updated successfully!',
			data: leave,
		});
	})
	.delete(async (req, res) => {
		// TODO: Check leave status is still pending

		await prisma.leave.delete({ where: { id: req.query.id as string } });

		return res.status(200).json({
			status: 'success',
			message: 'Leave deleted successfully',
		});
	});
