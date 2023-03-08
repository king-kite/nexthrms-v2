import {
	getAllOvertime,
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
		const overtime = await getAllOvertime({
			...params,
			id: req.user.employee.id,
		});

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

		// TODO: Check if the user has an approved/pending overtime

		const date = new Date(data.date);
		date.setHours(0, 0, 0, 0);

		const attendance = await prisma.attendance.findFirst({
			where: {
				date,
				employeeId: req.user.employee.id,
			},
			select: { id: true },
		});

		const overtime = await prisma.overtime.create({
			data: {
				...data,
				date,
				employee: {
					connect: {
						id: req.user.employee.id,
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
			mesage: 'Request for overtime was successful!',
			data: overtime,
		});
	});
