import { Prisma } from '@prisma/client';

import { attendanceSelectQuery as selectQuery, prisma } from '../../../../db';
import { auth } from '../../../../middlewares';
import { AttendanceCreateType } from '../../../../types';
import { attendanceCreateSchema } from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const data = await prisma.attendance.findUnique({
			where: {
				id: req.query.id as string,
			},
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched attendance!',
			data,
		});
	})
	.put(async (req, res) => {
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
