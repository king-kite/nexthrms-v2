import { Prisma } from '@prisma/client';

import { permissions, MEDIA_PROFILE_URL } from '../../../config';
import prisma from '../../../db';
import {
	employeeSelectQuery as selectQuery,
	getEmployees,
} from '../../../db/queries/employees';
import {
	addObjectPermissions,
	getEmployeeOfficersId,
	getRecords,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { EmployeeType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { hashPassword } from '../../../utils/bcrypt';
import { NextErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createEmployeeSchema } from '../../../validators/employees';

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

		throw new NextErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.employee.CREATE,
			]);

		if (!hasPerm) throw new NextErrorMessage(403);

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

		const valid = await createEmployeeSchema.validate(form, {
			abortEarly: false,
		});
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

				const location = MEDIA_PROFILE_URL + name;

				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				valid.user.profile.image = {
					url: result.secure_url || result.url,
					name,
					size: files.image.size,
					type: 'image',
					storageInfo: {
						location: result.location,
						public_id: result.public_id,
						name: result.original_filename,
						type: result.resource_type,
					},
					userId: req.user.id,
				};
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('EMPLOYEE IMAGE ERROR :>> ', error);
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
							create: {
								...valid.user.profile,
								image: valid.user.profile.image
									? {
											create: valid.user.profile.image as any,
									  }
									: undefined,
							},
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
						connect: valid.supervisors.map((id: string) => ({ id })),
				  }
				: undefined,
			user,
		};

		const employee = (await prisma.employee.create({
			data,
			select: selectQuery,
		})) as unknown as EmployeeType;

		// Set the object permissions
		const creatorPromises = [
			// Give the creator all permissions on the employee
			addObjectPermissions({
				model: 'employees',
				objectId: employee.id,
				users: [req.user.id],
			}),
		];

		if (valid.user) {
			creatorPromises.push(
				// Give the creator all permissions on the user as well
				addObjectPermissions({
					model: 'users',
					objectId: employee.user.id,
					users: [req.user.id],
				})
			);
			if (valid.user && files.image && employee.user.profile?.image) {
				// set managed files permissions
				creatorPromises.push(
					addObjectPermissions({
						model: 'managed_files',
						objectId: employee.user.profile.image.id,
						users: [req.user.id, employee.user.id],
					})
				);
			}
		}

		await Promise.all(creatorPromises);

		// Get the employees admin related officers
		let officers = await getEmployeeOfficersId(employee.id);
		officers = officers.filter((officer) => officer !== req.user.id);

		// add the admin officers for the user to view
		await Promise.all([
			updateObjectPermissions({
				model: 'employees',
				permissions: ['VIEW'],
				objectId: employee.id,
				users: officers,
			}),
			updateObjectPermissions({
				model: 'users',
				permissions: ['VIEW'],
				objectId: employee.user.id,
				users: officers,
			}),
		]);

		return res.status(201).json({
			status: 'success',
			message: 'Employee was created successfully',
			data: employee,
		});
	});
