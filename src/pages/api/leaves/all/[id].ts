import { permissions } from '../../../../config';
import {
	getLeave,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { employee } from '../../../../middlewares';
import { leaveCreateSchema } from '../../../../validators';
import { CreateLeaveQueryType } from '../../../../types';
import { hasPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default employee()
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(req.user.allPermissions, [permissions.leave.VIEW]);

		const leave = await getLeave(req.query.id as string);

		if (!leave) {
			return res.status(404).json({
				status: 'error',
				message: 'Leave with specified ID was not found!',
			});
		}

		if (!hasPerm || leave.employee?.id !== req.user.employee.id) {
			throw new NextApiErrorMessage(403);
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leave successfully!',
			data: leave,
		});
	})
	.put(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(req.user.allPermissions, [permissions.leave.EDIT]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const exLeave = await prisma.leave.findUniqueOrThrow({
			where: { id: req.query.id as string },
			select: { employee: { select: { id: true } } },
		});

		if (exLeave.employee.id !== req.user.employee.id)
			throw new NextApiErrorMessage(403);

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
		const hasPerm =
			req.user.isSuperUser ||
			hasPermission(req.user.allPermissions, [permissions.leave.DELETE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const exLeave = await prisma.leave.findUniqueOrThrow({
			where: { id: req.query.id as string },
			select: { status: true, employee: { select: { id: true } } },
		});

		if (exLeave.employee.id !== req.user.employee.id)
			throw new NextApiErrorMessage(403);

		if (exLeave.status === 'APPROVED') {
			return res.status(400).json({
				status: 'error',
				message:
					'This leave has already been approved and can no longer be deleted!',
			});
		}

		await prisma.leave.delete({ where: { id: req.query.id as string } });

		return res.status(200).json({
			status: 'success',
			message: 'Leave deleted successfully',
		});
	});
