import { Prisma } from '@prisma/client';

import { permissions } from '../../../../config';
import {
	userSelectQuery as selectQuery,
	getUser,
	prisma,
} from '../../../../db';
import { getUserObjectPermissions } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { CreateUserQueryType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { upload as uploadFile } from '../../../../utils/files';
import parseForm from '../../../../utils/parseForm';
import { createUserSchema } from '../../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.VIEW]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'users',
				objectId: req.query.id as string,
				permission: 'VIEW',
				userId: req.user.id,
			});
			if (objPerm.view === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const user = await getUser(req.query.id as string);

		if (!user) {
			return res.status(404).json({
				status: 'success',
				message: 'User with specified ID was not found!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched user successfully',
			data: user,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'users',
				objectId: req.query.id as string,
				permission: 'EDIT',
				userId: req.user.id,
			});
			if (objPerm.edit === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const { fields, files } = (await parseForm(req)) as {
			files: any;
			fields: any;
		};
		if (!fields.form) {
			return res.status(400).json({
				status: 'error',
				message: "'form' field is required",
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
					console.log('EMPLOYEE UPDATE IMAGE ERROR :>> ', error);
			}
		}

		const employee = valid.employee
			? {
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
					supervisor: valid.employee.supervisor
						? {
								connect: {
									id: valid.employee.supervisor,
								},
						  }
						: {},
			  }
			: {};

		const data: Prisma.UserUpdateInput = {
			...valid,
			profile: {
				update: {
					...valid.profile,
				},
			},
			employee: valid.employee
				? {
						upsert: {
							create: employee,
							update: employee,
						},
				  }
				: {},
			client: valid.client
				? {
						upsert: {
							create: {
								...valid.client,
							},
							update: {
								...valid.client,
							},
						},
				  }
				: {},
		};

		const user = (await prisma.user.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: selectQuery,
		})) as unknown;

		return res.status(200).json({
			status: 'success',
			message: 'User was updated successfully',
			data: user,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.user.DELETE]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'users',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.user.delete({
			where: {
				id: req.query.id as string,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'User was deleted successfully!',
		});
	});
