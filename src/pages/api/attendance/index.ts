import { Prisma } from '@prisma/client';

import permissions from '../../../config/permissions';
import prisma from '../../../db';
import {
	getAttendance,
	attendanceSelectQuery as selectQuery,
} from '../../../db/queries/attendance';
import {
	getRecords,
	addObjectPermissions,
	getEmployeeOfficersId,
} from '../../../db/utils';
import { employee } from '../../../middlewares';
import { AttendanceType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { NextApiErrorMessage } from '../../../utils/classes';
import { attendanceActionSchema } from '../../../validators/attendance';

export default employee()
	.get(async (req, res) => {
		const placeholder = {
			total: 0,
			result: [],
		};
		const result = await getRecords({
			model: 'attendance',
			perm: 'attendance',
			placeholder,
			user: req.user,
			query: req.query,
			getData(params) {
				return getAttendance({
					...params,
					id: req.user.employee.id,
				});
			},
		});

		if (result) return res.status(200).json(result);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched data successfully!',
			data: placeholder,
		});
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.attendance.MARK,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const { action } = await attendanceActionSchema.validate({ ...req.body });

		const date = new Date();

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

			const data: Prisma.AttendanceCreateInput = {
				employee: {
					connect: {
						id: req.user.employee.id,
					},
				},
				date,
				punchIn: time,
			};
			const result = (await prisma.attendance.create({
				data,
				select: selectQuery,
			})) as unknown as AttendanceType;

			// Add object level permissions
			const officers = await getEmployeeOfficersId(result.employee.id);

			await addObjectPermissions({
				model: 'attendance',
				objectId: result.id,
				permissions: ['VIEW'],
				users: [req.user.id, ...officers.filter((id) => id !== req.user.id)],
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
