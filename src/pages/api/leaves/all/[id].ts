import {
	getLeave,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { getUserObjectPermissions } from '../../../../db/utils';
import { employee } from '../../../../middlewares';
import { leaveCreateSchema } from '../../../../validators';
import { CreateLeaveQueryType } from '../../../../types';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default employee()
	.get(async (req, res) => {
		const leave = await getLeave(req.query.id as string);

		if (!leave) {
			return res.status(404).json({
				status: 'error',
				message: 'Leave with specified ID was not found!',
			});
		}

		if (leave.employee.id !== req.user.employee.id) {
			throw new NextApiErrorMessage(403);
		}

		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'leaves',
			objectId: req.query.id as string,
			permission: 'VIEW',
			userId: req.user.id,
		});

		// If the user no longer has view permission
		// Should have on create
		if (!objPerm.view) throw new NextApiErrorMessage(403);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leave successfully!',
			data: leave,
		});
	})
	.put(async (req, res) => {
		const leave = await getLeave(req.query.id as string);

		if (!leave) {
			return res.status(404).json({
				status: 'error',
				message: 'Leave with specified ID was not found!',
			});
		}

		if (leave.employee.id !== req.user.employee.id) {
			throw new NextApiErrorMessage(403);
		}

		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'leaves',
			objectId: req.query.id as string,
			permission: 'EDIT',
			userId: req.user.id,
		});

		// If the user no longer has edit permission
		// Should have on create
		if (!objPerm.edit) throw new NextApiErrorMessage(403);

		// check if the leave has been approved or denied
		// as long as the leave is still pending, the user can edit is as he/she likes
		if (leave.status === 'APPROVED' || leave.status === 'DENIED') {
			return res.status(403).json({
				status: 'error',
				message: `This leave has already either been ${leave.status.toLowerCase()} and can no longer be updated!`,
			});
		}

		const { employee, ...data }: CreateLeaveQueryType =
			await leaveCreateSchema.validateAsync({
				...req.body,
			});

		const startDate = new Date(data.startDate);
		startDate.setHours(0, 0, 0, 0);

		const endDate = new Date(data.endDate);
		endDate.setHours(0, 0, 0, 0);

		const updated = await prisma.leave.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				...data,
				startDate,
				endDate,
				status: 'PENDING' // Force the update to be pending
			},
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			mesage: 'Leave request was updated successfully!',
			data: updated,
		});
	})
	.delete(async (req, res) => {
		const exLeave = await prisma.leave.findUniqueOrThrow({
			where: { id: req.query.id as string },
			select: { status: true, employee: { select: { id: true } } },
		});

		if (exLeave.employee.id !== req.user.employee.id)
			throw new NextApiErrorMessage(403);

		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'leaves',
			objectId: req.query.id as string,
			permission: 'DELETE',
			userId: req.user.id,
		});

		// If the user no longer has delete permission
		// Should have on create
		if (!objPerm.delete) throw new NextApiErrorMessage(403);

		if (exLeave.status === 'APPROVED' || exLeave.status === 'DENIED') {
			return res.status(403).json({
				status: 'error',
				message:
					'This leave has already either been approved/denied and can no longer be deleted!',
			});
		}

		await prisma.leave.delete({ where: { id: req.query.id as string } });

		return res.status(200).json({
			status: 'success',
			message: 'Leave deleted successfully',
		});
	});
