import {
	getOvertime,
	prisma,
	overtimeSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import {
	overtimeApprovalSchema,
	overtimeCreateSchema,
} from '../../../../validators';
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
	.post(async (req, res) => {
		const {
			approval,
		}: {
			approval: 'APPROVED' | 'DENIED';
		} = await overtimeApprovalSchema.validateAsync({ ...req.body });
		const overtime = await prisma.overtime.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				status: approval,
			},
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			mesage:
				'Request for overtime was ' +
				(approval === 'DENIED' ? 'denied!' : 'approved!'),
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

		if (!employee) {
			return res.status(400).json({
				status: 'error',
				message: 'Employee ID is required!',
			});
		}

		// TODO: Check if the user has an approved/pending overtime

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
				attendance: {
					connect: {
						date_employeeId: {
							date: data.date,
							employeeId: employee,
						},
					},
				},
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
