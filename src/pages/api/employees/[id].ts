import { Prisma } from '@prisma/client';

import {
	employeeSelectQuery as selectQuery,
	firebaseBucket,
	getEmployee,
	prisma,
} from '../../../db';
import { auth } from '../../../middlewares';
import { CreateEmployeeQueryType } from '../../../types';
import parseForm from '../../../utils/parseForm';
import { createEmployeeSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const employee = await getEmployee(req.query.id as string);

		if (!employee) {
			return res.status(404).json({
				status: 'success',
				message: 'Employee with specified ID was not found!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched employee successfully',
			data: employee,
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
					console.log('FIREBASE EMPLOYEE UPDATE IMAGE ERROR :>> ', error);
			}
		}
		const user: {
			update?: Prisma.UserUpdateInput;
			connect?: { id: string };
		} = valid.user
			? {
					update: {
						...valid.user,
						email: valid.user.email.trim().toLowerCase(),
						profile: {
							update: valid.user.profile,
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

		const data: Prisma.EmployeeUpdateInput = {
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

		const employee = await prisma.employee.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: selectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Employee was updated successfully',
			data: employee,
		});
	})
	.delete(async (req, res) => {
		await prisma.employee.delete({
			where: {
				id: req.query.id as string,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Employee was deleted successfully!',
		});
	});
