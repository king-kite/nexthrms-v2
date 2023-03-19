import { permissions } from '../../../../config';
import {
	getOvertime,
	prisma,
	overtimeSelectQuery as selectQuery,
} from '../../../../db';
import { getRecord, getUserObjectPermissions } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { employeeMiddleware as employee } from '../../../../middlewares/api';
import { CreateOvertimeQueryType, OvertimeType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import {
	overtimeApprovalSchema,
	overtimeCreateSchema,
} from '../../../../validators';

export default admin()
	.get(async (req, res) => {
		const record = await getRecord<OvertimeType | null>({
			model: 'overtime',
			perm: 'overtime',
			objectId: req.query.id as string,
			permission: 'VIEW',
			user: req.user,
			getData() {
				return getOvertime(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: 'success',
				message: 'Overtime record with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched overtime record successfully!',
			data: record.data,
		});
	})
	.use(employee)
	.post(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.overtime.GRANT]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const overtime = await getOvertime(req.query.id as string);
		if (!overtime)
			return res.status(404).json({
				status: 'error',
				message: 'Overtime record with specified ID was not found!',
			});

		const {
			approval,
		}: {
			approval: 'APPROVED' | 'DENIED';
		} = await overtimeApprovalSchema.validateAsync({ ...req.body });

		const date =
			typeof overtime.date === 'string'
				? new Date(overtime.date)
				: overtime.date;
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		// If the overtime date is today or next date i.e the current date or days after today
		// and it is still pending then it can be approved/denied and also updated and deleted.
		// Means that the overtime has yet to commence.
		// If request user is a super user, then bypass the restriction

		if (
			req.user.isSuperUser ||
			(currentDate.getTime() <= date.getTime() && overtime.status === 'PENDING')
		) {
			const data = await prisma.overtime.update({
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
					'Request for overtime was ' +
					(approval === 'DENIED' ? 'denied!' : 'approved!'),
				data,
			});
		}
		// 	date.getTime() > currentDate.getTime() &&
		// 	(data.status === 'APPROVED') || data.status === 'DENIED'
		// ) {
		// 	// Meaning that the date for overtime is either today or has passed
		// 	// and the overtime has either been approved or denied so no updates, deletes, nor approval should be made
		// }
		return res.status(403).json({
			status: 'error',
			message:
				"This overtime request is passed it's date and can no longer be " +
				approval.toLowerCase() +
				'.',
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.overtime.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'overtime',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (objPerm.edit === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const overtime = await getOvertime(req.query.id as string);
		if (!overtime)
			return res.status(404).json({
				status: 'error',
				message: 'Overtime record with specified ID was not found!',
			});

		const date =
			typeof overtime.date === 'string'
				? new Date(overtime.date)
				: overtime.date;
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		// If the overtime date is today or next date i.e the current date or days after today
		// and it is still pending then it can be approved/denied and also updated and deleted.
		// Means that the overtime has yet to commence.
		// If request user is a super user, then bypass the restriction

		if (
			req.user.isSuperUser ||
			(currentDate.getTime() <= date.getTime() && overtime.status === 'PENDING')
		) {
			const { employee, ...data }: CreateOvertimeQueryType =
				await overtimeCreateSchema.validateAsync({
					...req.body,
				});

			if (!employee) {
				return res.status(400).json({
					status: 'error',
					message: 'Employee ID is required!',
				});
			}
			const date = new Date(data.date);
			date.setHours(0, 0, 0, 0);

			const attendance = await prisma.attendance.findFirst({
				where: {
					date,
					employeeId: employee,
				},
				select: { id: true },
			});

			const overtime = await prisma.overtime.update({
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
					attendance: attendance
						? {
								connect: {
									id: attendance.id,
								},
						  }
						: {},
				},
				select: selectQuery,
			});

			return res.status(200).json({
				status: 'success',
				mesage: 'Request for overtime was updated successfully!',
				data: overtime,
			});
		}
		// 	date.getTime() > currentDate.getTime() &&
		// 	(data.status === 'APPROVED') || data.status === 'DENIED'
		// ) {
		// 	// Meaning that the date for overtime is either today or has passed
		// 	// and the overtime has either been approved or denied so no updates, deletes, nor approval should be made
		// }
		return res.status(403).json({
			status: 'error',
			message:
				"This overtime request is passed it's date and can no longer be updated.",
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.overtime.DELETE,
			]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'overtime',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const overtime = await getOvertime(req.query.id as string);
		if (!overtime)
			return res.status(404).json({
				status: 'error',
				message: 'Overtime record with specified ID was not found!',
			});

		const date =
			typeof overtime.date === 'string'
				? new Date(overtime.date)
				: overtime.date;
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		// If the overtime date is today or next date i.e the current date or days after today
		// and it is still pending then it can be approved/denied and also updated and deleted.
		// Means that the overtime has yet to commence.
		// If request user is a super user, then bypass the restriction

		if (
			req.user.isSuperUser ||
			(currentDate.getTime() <= date.getTime() && overtime.status === 'PENDING')
		) {
			await prisma.overtime.delete({ where: { id: req.query.id as string } });

			return res.status(200).json({
				status: 'success',
				message: 'Overtime deleted successfully',
			});
		}
		// 	date.getTime() > currentDate.getTime() &&
		// 	(data.status === 'APPROVED') || data.status === 'DENIED'
		// ) {
		// 	// Meaning that the date for overtime is either today or has passed
		// 	// and the overtime has either been approved or denied so no updates, deletes, nor approval should be made
		// }
		return res.status(403).json({
			status: 'error',
			message:
				"This overtime request is passed it's date and can no longer be deleted.",
		});
	});
