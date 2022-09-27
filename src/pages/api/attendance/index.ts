import { Prisma } from '@prisma/client';

import {
	getAttendance,
	prisma,
	attendanceSelectQuery as selectQuery,
} from '../../../db';
import { auth } from '../../../middlewares';
import { AttendanceType } from '../../../types';
import { attendanceActionSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can get attendance records.',
			});
		}

		const result = await getAttendance({ id: req.user.employee.id });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched attendance records successfully!',
			data: result,
		});
	})
	.post(async (req, res) => {
		if (!req.user.employee) {
			return res.status(400).json({
				status: 'error',
				message: 'Only employee can alter an attendance record.',
			});
		}

		const { action }: { action: 'IN' | 'OUT' } =
			await attendanceActionSchema.validateAsync({ ...req.body });

		const date = new Date();
		date.setHours(0, 0, 0, 0);

		const attendance = await prisma.attendance.findUnique({
			where: {
				date_employeeId: {
					date,
					employeeId: req.user.employee.id,
				},
			},
			select: selectQuery,
		});

		// if attendance exists and action is 'IN' return attendance
		if (action === 'IN' && attendance) {
			if ((attendance as AttendanceType).punchOut) {
				return res.status(400).json({
					status: 'error',
					message: 'Punched out already!',
				});
			}
			return res.status(200).json({
				status: 'success',
				message: 'Punched In Already!',
				data: attendance,
			});
		}

		// if attendance does not exists and action is 'IN' create new attendance
		if (action === 'IN' && !attendance) {
			const time = new Date();

			// check if the employee has an overtime for today
			const overtime = await prisma.overtime.findUnique({
				where: {
					date_employeeId: {
						date,
						employeeId: req.user.employee.id,
					},
				},
				select: { id: true },
			});
			const data: Prisma.AttendanceCreateInput = {
				employee: {
					connect: {
						id: req.user.employee.id,
					},
				},
				date,
				punchIn: time,
			};
			if (overtime) {
				data.overtime = {
					connect: {
						id: overtime.id,
					},
				};
			}
			const result = await prisma.attendance.create({
				data,
				select: selectQuery,
			});

			return res.status(200).json({
				status: 'success',
				message: 'Punched In!',
				data: result,
			});
		}

		// if attendance does not exists and action is 'OUT' return error
		if (action === 'OUT' && !attendance) {
			return res.status(400).json({
				status: 'error',
				message: 'Not punched in for the day!.',
			});
		}

		// if attendance exists and action is 'OUT' update punch out field
		if (action === 'OUT' && attendance) {
			if ((attendance as AttendanceType).punchOut) {
				return res.status(400).json({
					status: 'error',
					message: 'Punched out already!',
				});
			}
			const time = new Date();
			const result = await prisma.attendance.update({
				where: { id: (attendance as AttendanceType).id },
				data: {
					punchOut: time,
				},
				select: selectQuery,
			});
			return res.status(200).json({
				status: 'success',
				message: 'Punched out!',
				data: result,
			});
		}
	});
