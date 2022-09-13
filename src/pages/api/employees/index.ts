import { Prisma } from '@prisma/client';

import {
	employeeSelectQuery as selectQuery,
	getEmployees,
	prisma,
} from '../../../db';
import { auth } from '../../../middlewares';
import { CreateEmployeeQueryType } from '../../../types';
import { hashPassword } from '../../../utils/bcrypt';
import { createEmployeeSchema, validateParams } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getEmployees({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Employees successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const valid: CreateEmployeeQueryType =
			await createEmployeeSchema.validateAsync({ ...req.body });

		if (!valid.user && !valid.userId) {
			return res.status(400).json({
				status: 'error',
				message: 'Provide either user object or userId.',
			});
		} else if (valid.user && valid.userId) {
			return res.status(400).json({
				status: 'error',
				message: 'Provide either user object or userId. Set the former to null',
			});
		}

		const user: {
			create?: Prisma.UserCreateInput;
			connect?: { id: string };
		} = valid.user
			? {
					create: {
						...valid.user,
						email: valid.user.email.trim().toLowerCase(),
						password: await hashPassword(valid.user.lastName.toUpperCase()),
						profile: {
							create: valid.user.profile,
						},
					},
			  }
			: valid.userId
			? {
					connect: {
						id: valid.userId,
					},
			  }
			: {};

		const data: Prisma.EmployeeCreateInput = {
			dateEmployed: valid.dateEmployed || new Date(),
			department: {
				connect: {
					id: valid.department,
				},
			},
			job: {
				connect: {
					id: valid.job,
				},
			},
			supervisor: valid.supervisor
				? {
						connect: {
							id: valid.supervisor,
						},
				  }
				: undefined,
			user,
		};

		const employee = await prisma.employee.create({
			data,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Employee was created successfully',
			data: employee,
		});
	});
