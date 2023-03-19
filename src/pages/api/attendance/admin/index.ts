import { Prisma } from '@prisma/client';

import { permissions } from '../../../../config';
import {
	attendanceSelectQuery as selectQuery,
	getAttendanceAdmin,
	prisma,
} from '../../../../db';
import { getRecords } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { AttendanceCreateType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { attendanceCreateSchema } from '../../../../validators';

export default admin()
	.get(async (req, res) => {
		const result = await getRecords({
			model: 'attendance',
			perm: 'attendance',
			user: req.user,
			query: req.query,
			placeholder: {
				total: 0,
				result: [],
			},
			getData(params) {
				return getAttendanceAdmin(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.attendance.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data: AttendanceCreateType =
			await attendanceCreateSchema.validateAsync({ ...req.body });

		const date = new Date(data.date);
		date.setHours(0, 0, 0, 0);

		const input: Prisma.AttendanceCreateInput = {
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
				connectOrCreate: {
					where: {
						date_employeeId: {
							date,
							employeeId: data.employee,
						},
					},
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
				},
			};
		}

		const result = await prisma.attendance.create({
			data: input,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Attendance was created successfully!',
			data: result,
		});
	});
