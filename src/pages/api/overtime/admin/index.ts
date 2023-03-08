import {
	getAllOvertimeAdmin,
	prisma,
	overtimeSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { overtimeCreateSchema, validateParams } from '../../../../validators';
import { CreateOvertimeQueryType } from '../../../../types';

export default auth()
	.get(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can request overtime',
			});
		}

		const params = validateParams(req.query);
		const overtime = await getAllOvertimeAdmin({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched overtime successfully',
			data: overtime,
		});
	})
	.post(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can request overtime',
			});
		}

		const data: CreateOvertimeQueryType =
			await overtimeCreateSchema.validateAsync({
				...req.body,
			});

		if (!data.employee) {
			return res.status(400).json({
				status: 'error',
				message: 'Employee ID is required',
			});
		}

		// TODO: Check if the user has an approved/pending leave

		const date = new Date(data.date);
		date.setHours(0, 0, 0, 0);

		const attendance = await prisma.attendance.findFirst({
			where: {
				date,
				employeeId: data.employee,
			},
			select: { id: true },
		});

		const overtime = await prisma.overtime.create({
			data: {
				...data,
				date,
				employee: {
					connect: {
						id: data.employee,
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

		return res.status(201).json({
			status: 'success',
			mesage: 'Request for overtime was created successfully!',
			data: overtime,
		});
	});
