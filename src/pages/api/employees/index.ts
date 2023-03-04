import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import {
	employeeSelectQuery as selectQuery,
	getEmployees,
	prisma,
} from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { CreateEmployeeQueryType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { hashPassword } from '../../../utils/bcrypt';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createEmployeeSchema, validateParams } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		// User doesn't need to an employee to view employees

		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.employee.VIEW]);

		// if the user has model permissions
		if (hasPerm) {
			const params = validateParams(req.query);
			const data = await getEmployees({ ...params });

			return res.status(200).json({
				status: 'success',
				message: 'Fetched Employees successfully! A total of ' + data.total,
				data,
			});
		}

		// if the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName: 'employees',
			permission: 'VIEW',
			userId: req.user.id,
		});

		if (userObjects.length > 0) {
			const params = validateParams(req.query);

			const data = await getEmployees({
				...params,
				where: {
					id: {
						in: userObjects.map((obj) => obj.objectId),
					},
				},
			});

			return res.status(200).json({
				status: 'success',
				message: 'Fetched Employees successfully! A total of ' + data.total,
				data,
			});
		}

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
