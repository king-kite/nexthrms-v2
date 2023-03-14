import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import { userSelectQuery as selectQuery, getUsers, prisma } from '../../../db';
import { addObjectPermissions, getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { CreateUserQueryType, UserType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { hashPassword } from '../../../utils/bcrypt';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createUserSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		const result = await getRecords<{
			total: number;
			result: UserType[];
			inactive: number;
			active: number;
			on_leave: number;
			employees: number;
			clients: number;
		}>({
			model: 'users',
			perm: 'user',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				active: 0,
				inactive: 0,
				on_leave: 0,
				employees: 0,
				clients: 0,
				result: [],
			},
			getData(params) {
				return getUsers(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.CREATE]);

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

		const valid: CreateUserQueryType = await createUserSchema.validateAsync(
			form
		);

		if (files.image) {
			// Upload a file to the bucket using firebase admin
			try {
				const name = (
					valid.firstName +
					'_' +
					valid.lastName +
					'_' +
					valid.email
				).toLowerCase();

				const location = `media/users/profile/${name}`;

				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				valid.profile.image = result.secure_url || result.url;
				Object(valid.profile).imageStorageInfo = {
					id: result.public_id,
					name: result.original_filename,
					type: result.resource_type,
				};
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('USER IMAGE ERROR :>> ', error);
			}
		}

		if (valid.isSuperUser && !req.user.isSuperUser) {
			return res.status(403).json({
				status: 'error',
				message: 'You are not authorized to create a super user!',
			});
		}

		if (valid.isAdmin && !req.user.isSuperUser && !req.user.isAdmin) {
			return res.status(403).json({
				status: 'error',
				message: 'You are not authorized to create an admin user!',
			});
		}

		const data: Prisma.UserCreateInput = {
			...valid,
			password: await hashPassword(valid.lastName.toUpperCase()),
			profile: {
				create: {
					...valid.profile,
				},
			},
			employee: valid.employee
				? {
						create: {
							...valid.employee,
							department: {
								connect: {
									id: valid.employee.department,
								},
							},
							job: {
								connect: {
									id: valid.employee.job,
								},
							},
							supervisors: valid.employee.supervisors
								? {
										connect: valid.employee.supervisors.map((id) => ({ id })),
								  }
								: undefined,
						},
				  }
				: {},
			client: valid.client
				? {
						create: {
							...valid.client,
						},
				  }
				: {},
		};
		const user = (await prisma.user.create({
			data,
			select: selectQuery,
		})) as unknown as UserType;

		if (user) {
			const permissionPromises = [
				addObjectPermissions({
					model: 'users',
					objectId: user.id,
					users: [req.user.id],
				}),
			];
			if (user.employee)
				permissionPromises.push(
					addObjectPermissions({
						model: 'employees',
						objectId: user.employee.id,
						users: [req.user.id],
					})
				);
			if (user.client)
				permissionPromises.push(
					addObjectPermissions({
						model: 'clients',
						objectId: user.client.id,
						users: [req.user.id],
					})
				);
			await Promise.all(permissionPromises);
		}

		return res.status(201).json({
			status: 'success',
			message: 'User was created successfully',
			data: user,
		});
	});
