import permissions from '../../../../config/permissions';
import prisma from '../../../../db';
import {
	getLeave,
	leaveSelectQuery as selectQuery,
} from '../../../../db/queries/leaves';
import { getRecord, getUserObjectPermissions } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { employeeMiddleware as employee } from '../../../../middlewares/api';
import { LeaveType } from '../../../../types';
import { hasModelPermission } from '../../../../utils/permission';
import { NextErrorMessage } from '../../../../utils/classes';
import {
	leaveApprovalSchema,
	leaveCreateSchema,
} from '../../../../validators/leaves';

export default admin()
	.get(async (req, res) => {
		const record = await getRecord<LeaveType | null>({
			model: 'leaves',
			perm: 'leave',
			objectId: req.query.id as string,
			permission: 'VIEW',
			user: req.user,
			getData() {
				return getLeave(req.query.id as string);
			},
		});

		if (!record) throw new NextErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: 'success',
				message: 'Leave with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leave successfully!',
			data: record.data,
		});
	})
	.use(employee)
	.post(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.leave.GRANT]);

		if (!hasPerm) throw new NextErrorMessage(403);

		hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.leave.VIEW]);
		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'leaves',
				objectId: req.query.id as string,
				permission: 'VIEW',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}
		// Cannot view
		if (!hasPerm) throw new NextErrorMessage(403);

		const leave = await getLeave(req.query.id as string);
		if (!leave)
			return res.status(404).json({
				status: 'error',
				message: 'Leave with specified ID was not found!',
			});

		const { approval } = await leaveApprovalSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		const startDate =
			typeof leave.startDate === 'string'
				? new Date(leave.startDate)
				: leave.startDate;
		const currentDate = new Date();
		// If the leave start date is today or next date i.e the current date or days after today
		// and it is still pending then it can be approved/denied and also updated and deleted.
		// Means that the leave has yet to commence.
		// If request user is a super user, then bypass the restriction
		if (
			req.user.isSuperUser ||
			(currentDate.getTime() <= startDate.getTime() &&
				leave.status === 'PENDING')
		) {
			const updated = await prisma.leave.update({
				where: {
					id: req.query.id as string,
				},
				data: {
					status: approval,
					approvedBy: {
						connect: {
							id: req.user.employee?.id,
						},
					},
				},
				select: selectQuery,
			});

			return res.status(200).json({
				status: 'success',
				mesage:
					'Leave request was ' +
					(approval === 'DENIED' ? 'denied!' : 'approved!'),
				data: updated,
			});
		}
		// 	startDate.getTime() > currentDate.getTime() &&
		// 	(data.status === 'APPROVED') || data.status === 'DENIED'
		// ) {
		// 	// Meaning that the start date for leave is either today or has passed
		// 	// and the leave has either been approved or denied so no updates, deletes, nor approval should be made
		// }
		return res.status(403).json({
			status: 'error',
			message:
				"This leave is passed it's start date and can no longer be " +
				approval.toLowerCase() +
				'.',
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.leave.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'leaves',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (objPerm.edit === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextErrorMessage(403);

		const leave = await getLeave(req.query.id as string);
		if (!leave)
			return res.status(404).json({
				status: 'error',
				message: 'Leave with specified ID was not found!',
			});

		const startDate =
			typeof leave.startDate === 'string'
				? new Date(leave.startDate)
				: leave.startDate;
		const currentDate = new Date();
		// If the leave start date is today or next date i.e the current date or days after today
		// and it is still pending then it can be approved/denied and also updated and deleted.
		// Means that the leave has yet to commence.
		// If the request user is a superuser, then bypass the restriction
		if (
			req.user.isSuperUser ||
			(currentDate.getTime() <= startDate.getTime() &&
				leave.status === 'PENDING')
		) {
			const { employee, ...data } = await leaveCreateSchema.validate(
				{
					...req.body,
				},
				{ abortEarly: false }
			);

			if (!employee) {
				return res.status(400).json({
					status: 'error',
					message: 'Employee ID is required!',
				});
			}

			// TODO: Check if the user has an approved/pending leave

			const updated = await prisma.leave.update({
				where: {
					id: req.query.id as string,
				},
				data: {
					...data,
					employee: {
						connect: {
							id: employee,
						},
					},
				},
				select: selectQuery,
			});

			return res.status(200).json({
				status: 'success',
				mesage: 'Leave request was updated successfully!',
				data: updated,
			});
		}

		// 	startDate.getTime() >= currentDate.getTime() &&
		// 	(data.status === 'APPROVED') || data.status === 'DENIED'
		// ) {
		// 	// Meaning that the start date for leave is either today or has passed
		// 	// and the leave has either been approved or denied so no updates, deletes, nor approval should be made
		// }
		return res.status(403).json({
			status: 'error',
			message:
				"This leave is passed it's start date and can no longer be updated.",
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.leave.DELETE]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'leaves',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextErrorMessage(403);

		const leave = await getLeave(req.query.id as string);
		if (!leave)
			return res.status(404).json({
				status: 'error',
				message: 'Leave with specified ID was not found!',
			});

		const startDate =
			typeof leave.startDate === 'string'
				? new Date(leave.startDate)
				: leave.startDate;
		const currentDate = new Date();
		// If the leave start date is today or next date i.e the current date or days after today
		// and it is still pending then it can be approved/denied and also updated and deleted.
		// Means that the leave has yet to commence.
		// If the request user is a superuser, then bypass the restriction
		if (
			req.user.isSuperUser ||
			(currentDate.getTime() <= startDate.getTime() &&
				leave.status === 'PENDING')
		) {
			await prisma.leave.delete({ where: { id: req.query.id as string } });

			return res.status(200).json({
				status: 'success',
				message: 'Leave deleted successfully',
			});
		}
		// 	startDate.getTime() >= currentDate.getTime() &&
		// 	(data.status === 'APPROVED') || data.status === 'DENIED'
		// ) {
		// 	// Meaning that the start date for leave is either today or has passed
		// 	// and the leave has either been approved or denied so no updates, deletes, nor approval should be made
		// }
		return res.status(403).json({
			status: 'error',
			message:
				"This leave is passed it's start date and can no longer be deleted.",
		});
	});
