import {
	getOvertime,
	prisma,
	overtimeSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { overtimeCreateSchema } from '../../../../validators';
import { CreateOvertimeQueryType } from '../../../../types';

export default auth()
	.get(async (req, res) => {
		const overtime = await getOvertime(req.query.id as string);
		// TODO: Check Permissions

		return res.status(200).json({
			status: 'success',
			message: 'Fetched overtime successfully!',
			data: overtime,
		});
	})
	.put(async (req, res) => {
		if (!req.user.employee) {
			return res.status(403).json({
				status: 'error',
				message: 'Only employees can request overtime',
			});
		}

		const { employee, ...data }: CreateOvertimeQueryType =
			await overtimeCreateSchema.validateAsync({
				...req.body,
			});

		// TODO: Check if the user has an approved/pending overtime

		const date = new Date(data.date);
		date.setHours(0, 0, 0, 0);

		const attendance = await prisma.attendance.findUnique({
			where: {
				date_employeeId: {
					date,
					employeeId: req.user.employee.id,
				},
			},
			select: { id: true },
		});

		const overtime = await prisma.overtime.update({
			where: {
				id: req.query.id as string,
			},
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

		return res.status(200).json({
			status: 'success',
			mesage: 'Request for overtime was updated successfully!',
			data: overtime,
		});
	})
	.delete(async (req, res) => {
		// TODO: Check overtime status is still pending

		await prisma.overtime.delete({ where: { id: req.query.id as string } });

		return res.status(200).json({
			status: 'success',
			message: 'Overtime deleted successfully',
		});
	});
