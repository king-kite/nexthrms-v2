import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import {
	employeeSelectQuery as selectQuery,
	getEmployees,
	prisma,
} from '../../../db';
import {
	addObjectPermissions,
	getRecords,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { CreateEmployeeQueryType, EmployeeType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { hashPassword } from '../../../utils/bcrypt';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createEmployeeSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		// User doesn't need to an employee to view employees

		const result = await getRecords<{
			total: number;
			result: EmployeeType[];
			inactive: number;
			active: number;
			on_leave: number;
		}>({
			model: 'employees',
			perm: 'employee',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				active: 0,
				inactive: 0,
				on_leave: 0,
				result: [],
			},
			getData(params) {
				return getEmployees(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.employee.CREATE,
			]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const { fields, files } = (await parseForm(req)) as {
			files: any;
			fields: any;
		};
		if (!fields.form) {
			return res.status(400).json({
				status: 'error',
				message: "'Form' field is required",
			});
		}
		const form = JSON.parse(fields.form);

		const valid: CreateEmployeeQueryType =
			await createEmployeeSchema.validateAsync(form);
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
		if (valid.user && files.image) {
			// Upload a file to the bucket using firebase admin
			try {
				const name = (
					valid.user.firstName +
					'_' +
					valid.user.lastName +
					'_' +
					valid.user.email
				).toLowerCase();

				const location = `media/users/profile/${name}`;

				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				valid.user.profile.image = result.secure_url || result.url;
				Object(valid.user.profile).imageStorageInfo = {
					id: result.public_id,
					name: result.original_filename,
					type: result.resource_type,
				};
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('FIREBASE EMPLOYEE IMAGE ERROR :>> ', error);
			}
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

		// const supervisors =

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
			supervisors: valid.supervisors
				? {
						connect: valid.supervisors.map((id) => ({ id })),
				  }
				: undefined,
			user,
		};

		const employee = (await prisma.employee.create({
			data,
			select: selectQuery,
		})) as unknown as EmployeeType;

		// Set the object permissions
		await Promise.all([
			// Give the creator all permissions on the employee
			addObjectPermissions({
				model: 'employees',
				objectId: employee.id,
				users: [req.user.id],
			}),

			// Give the creator all permissions on the user as well
			addObjectPermissions({
				model: 'users',
				objectId: employee.user.id,
				users: [req.user.id],
			}),
		]);

		// Get the employees admin related officers
		const officers = await prisma.user.findMany({
			where: {
				isActive: true,
				OR: [
					// Super users
					{
						isSuperUser: true,
					},
					// Get the employee's supervisor
					{
						isAdmin: true,
						employee: {
							supervisedEmployees: {
								some: {
									id: { in: [employee.id] },
								},
							},
						},
					},
					// Get the employee's department HOD
					{
						isAdmin: true,
						employee: employee.department
							? {
									hod: {
										name: employee.department.name,
									},
							  }
							: undefined,
					},
				],
			},
			select: { id: true },
		});

		// add the admin officers for the user to view
		await Promise.all([
			updateObjectPermissions({
				model: 'employees',
				permissions: ['VIEW'],
				objectId: employee.id,
				users: officers.map((officer) => officer.id),
			}),
			updateObjectPermissions({
				model: 'users',
				permissions: ['VIEW'],
				objectId: employee.user.id,
				users: officers.map((officer) => officer.id),
			}),
		]);

		return res.status(201).json({
			status: 'success',
			message: 'Employee was created successfully',
			data: employee,
		});
	});
