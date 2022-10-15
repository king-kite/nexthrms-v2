import { Prisma } from '@prisma/client';

import {
	attendanceSelectQuery as selectQuery,
	getAttendanceAdmin,
	prisma,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { AttendanceCreateType } from '../../../../types';
import { attendanceCreateSchema, validateParams } from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Permission Denied!',
			});
		}
		const params = validateParams({ ...req.query });
		const data = await getAttendanceAdmin({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched all attendance! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
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
