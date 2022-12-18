import { Prisma } from '@prisma/client';

import { userSelectQuery as selectQuery, getUser, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { CreateUserQueryType, UserType } from '../../../types';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createUserSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
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
			data: user as UserType,
		});
	})
	.delete(async (req, res) => {
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
