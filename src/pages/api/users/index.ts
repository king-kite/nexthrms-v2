import { Prisma } from '@prisma/client';

import { userSelectQuery as selectQuery, getUsers, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { CreateUserQueryType } from '../../../types';
import { hashPassword } from '../../../utils/bcrypt';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createUserSchema, validateParams } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getUsers({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched Users successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
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
							supervisor: valid.employee.supervisor
								? {
										connect: {
											id: valid.employee.supervisor,
										},
								  }
								: {},
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
		const user = await prisma.user.create({
			data,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'User was created successfully',
			data: user,
		});
	});