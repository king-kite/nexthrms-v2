import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import {
	employeeSelectQuery as selectQuery,
	getEmployee,
	prisma,
} from '../../../db';
import { getRecord, getUserObjectPermissions } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { CreateEmployeeQueryType, EmployeeType } from '../../../types';
import { hasModelPermission } from '../../../utils';
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
		const record = await getRecord<EmployeeType | null>({
			model: 'employees',
			objectId: req.query.id as string,
			perm: 'employee',
			permission: 'VIEW',
			user: req.user,
			getData() {
				return getEmployee(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data) {
			return res.status(404).json({
				status: 'success',
				message: 'Employee with specified ID was not found!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched employee successfully',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.employee.EDIT]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'employees',
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
					console.log('EMPLOYEE UPDATE IMAGE ERROR :>> ', error);
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
			supervisors: valid.supervisors
				? {
						set: valid.supervisors.map((id) => ({ id })),
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
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [
				permissions.employee.DELETE,
			]);

		if (!hasPerm) {
			// check if the user has a view object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'employees',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

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
