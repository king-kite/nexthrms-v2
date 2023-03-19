import { Prisma } from '@prisma/client';

import { permissions } from '../../../../config';
import {
	attendanceSelectQuery as selectQuery,
	prisma,
	getSingleAttendance,
} from '../../../../db';
import { getRecord, getUserObjectPermissions } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { AttendanceCreateType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { attendanceCreateSchema } from '../../../../validators';

export default admin()
	.get(async (req, res) => {
		const record = await getRecord({
			model: 'attendance',
			perm: 'attendance',
			permission: 'VIEW',
			objectId: req.query.id as string,
			user: req.user,
			getData() {
				return getSingleAttendance(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: 'error',
				message: 'Attendance record with the specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched attendance!',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.attendance.EDIT,
			]);

		if (!hasPerm) {
			const perms = await getUserObjectPermissions({
				modelName: 'attendance',
				permission: 'EDIT',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
			hasPerm = perms.edit;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: AttendanceCreateType =
			await attendanceCreateSchema.validateAsync({ ...req.body });

		const date = new Date(data.date);
		date.setHours(0, 0, 0, 0);

		const input: Prisma.AttendanceUpdateInput = {
			employee: {
				connect: {
					id: data.employee,
				},
			},
			punchIn: data.punchIn,
			punchOut: data.punchOut,
			date,
		};
		if (data.overtime) {
			input.overtime = {
				upsert: {
					create: {
						date,
						employee: {
							connect: {
								id: data.employee,
							},
						},
						hours: data.overtime.hours,
						reason: data.overtime.reason,
					},
					update: {
						date,
						employee: {
							connect: {
								id: data.employee,
							},
						},
						hours: data.overtime.hours,
						reason: data.overtime.reason,
					},
				},
			};
		}

		const result = await prisma.attendance.update({
			where: {
				id: req.query.id as string,
			},
			data: input,
			select: selectQuery,
		});

		return res.status(200).json({
			message: 'Attendance record updated successfully!',
			status: 'success',
			data: result,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.attendance.DELETE,
			]);

		if (!hasPerm) {
			const perms = await getUserObjectPermissions({
				modelName: 'attendance',
				permission: 'DELETE',
				objectId: req.query.id as string,
				userId: req.user.id,
			});
			hasPerm = perms.delete;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.attendance.delete({
			where: {
				id: req.query.id as string,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Attendance record was deleted!',
		});
	});
