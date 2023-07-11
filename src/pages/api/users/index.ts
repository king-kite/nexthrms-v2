import { Prisma } from '@prisma/client';

import { permissions, MEDIA_PROFILE_URL } from '../../../config';
import prisma from '../../../db';
import {
	userSelectQuery as selectQuery,
	getUsers,
} from '../../../db/queries/users';
import { addObjectPermissions, getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { UserType } from '../../../types';
import { hasModelPermission } from '../../../utils/permission';
import { hashPassword } from '../../../utils/bcrypt';
import { NextErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createUserSchema } from '../../../validators/users';

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

		throw new NextErrorMessage(403);
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.CREATE]);

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

		const valid = await createUserSchema.validate(form, { abortEarly: false });

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

				const location = MEDIA_PROFILE_URL + name;

				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				valid.profile.image = {
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
					image: valid.profile.image
						? {
								create: valid.profile.image as any,
						  }
						: undefined,
				},
			},
			employee: valid.employee
				? {
						create: {
							...valid.employee,
							dateEmployed: valid.employee.dateEmployed || new Date(),
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
										connect: valid.employee.supervisors.map((id: string) => ({
											id,
										})),
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
			// set managed files permissions
			if (user.profile?.image) {
				addObjectPermissions({
					model: 'managed_files',
					objectId: user.profile.image.id,
					users: [req.user.id, user.id],
				});
			}
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
