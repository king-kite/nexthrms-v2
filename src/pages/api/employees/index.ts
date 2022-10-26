import { Prisma } from '@prisma/client';

import {
	employeeSelectQuery as selectQuery,
	firebaseBucket,
	getEmployees,
	prisma,
} from '../../../db';
import { auth } from '../../../middlewares';
import { CreateEmployeeQueryType } from '../../../types';
import { hashPassword } from '../../../utils/bcrypt';
import parseForm from '../../../utils/parseForm';
import { createEmployeeSchema, validateParams } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

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
				const splitText = files.image.originalFilename?.split('.');
				const extension = splitText[splitText.length - 1];
				const [obj, file] = await firebaseBucket.upload(files.image.filepath, {
					contentType: files.image.mimetype || undefined,
					destination: `users/employees/${name}.${extension}`,
				});
				valid.user.profile.image = file.mediaLink;
				Object(valid.user.profile).imageStorageInfo = {
					name: file.name,
					generation: file.generation,
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
