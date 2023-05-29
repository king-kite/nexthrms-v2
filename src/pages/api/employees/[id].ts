import { Prisma } from '@prisma/client';

import {
	permissions,
	DEFAULT_IMAGE,
	USE_LOCAL_MEDIA_STORAGE,
} from '../../../config';
import {
	employeeSelectQuery as selectQuery,
	getEmployee,
	prisma,
} from '../../../db';
import {
	getRecord,
	getUserObjectPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { EmployeeType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { deleteFile, upload as uploadFile } from '../../../utils/files';
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

		const valid = await createEmployeeSchema.validateAsync(form);
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

				valid.user.profile.image = {
					url: result.secure_url || result.url,
					name: result.original_filename,
					size: files.image.size,
					type: 'image',
					storageInfo: {
						id: result.public_id,
						name: result.original_filename,
						type: result.resource_type,
					},
					userId: req.user.id,
				};

				// delete the old employee user profile image
				const employee = await prisma.employee.findUnique({
					where: {
						id: req.query.id as string,
					},
					select: {
						user: {
							select: {
								profile: {
									select: {
										image: {
											select: {
												url: true,
												storageInfo: true,
											},
										},
									},
								},
							},
						},
					},
				});
				if (
					employee?.user.profile?.image &&
					employee.user.profile.image.url !== DEFAULT_IMAGE
				) {
					const id = USE_LOCAL_MEDIA_STORAGE
						? employee.user.profile.image.url
						: (employee.user.profile.image.storageInfo as any)?.publicc_id;
					deleteFile(id).catch((error) => {
						console.log('DELETE EMPLOYEE IMAGE FILE ERROR :>>', error);
					});
				}
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
							update: {
								...valid.user.profile,
								image: {
									upsert: {
										create: valid.user.profile.image,
										update: valid.user.profile.image,
									},
								},
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
						set: valid.supervisors.map((id: string) => ({ id })),
				  }
				: undefined,
			user,
		};

		const employee = (await prisma.employee.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: selectQuery,
		})) as unknown as EmployeeType;

		if (valid.user && files.image && employee.user.profile?.image) {
			// set managed files permissions
			await updateObjectPermissions({
				model: 'managed_files',
				objectId: employee.user.profile.image.id,
				users: [req.user.id, employee.user.id],
			});
		}

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
