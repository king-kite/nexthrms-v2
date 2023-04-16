import { Prisma } from '@prisma/client';

import {
	permissions,
	DEFAULT_IMAGE,
	USE_LOCAL_MEDIA_STORAGE,
} from '../../../../config';
import {
	userSelectQuery as selectQuery,
	getUser,
	prisma,
} from '../../../../db';
import { getRecord, getUserObjectPermissions } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { CreateUserQueryType, UserType } from '../../../../types';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';
import { deleteFile, upload as uploadFile } from '../../../../utils/files';
import parseForm from '../../../../utils/parseForm';
import { createUserSchema } from '../../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		const record = await getRecord<UserType | null>({
			model: 'users',
			objectId: req.query.id as string,
			perm: 'user',
			permission: 'VIEW',
			user: req.user,
			getData() {
				return getUser(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data) {
			return res.status(404).json({
				status: 'success',
				message: 'User with specified ID was not found!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched user successfully',
			data: record.data,
		});
	})
	.use(async (req, res, next) => {
		const message = req.method === 'PUT' ? 'update' : 'delete';

		const oldUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: req.query.id as string,
			},
			select: {
				isSuperUser: true,
				isAdmin: true,
			},
		});

		// Only super user update super user
		if (oldUser.isSuperUser && !req.user.isSuperUser) {
			return res.status(403).json({
				status: 'error',
				message: `You are not authorized to ${message} this user!`,
			});
		}

		// Only admin or super user update admin user
		if (oldUser.isAdmin && !req.user.isSuperUser && !req.user.isAdmin) {
			return res.status(403).json({
				status: 'error',
				message: `You are not authorized to ${message} this user!`,
			});
		}

		next();
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

				// delete the old user profile image
				const profile = await prisma.profile.findUnique({
					where: {
						userId: req.query.id as string,
					},
					select: {
						image: true,
						imageStorageInfo: true,
					},
				});
				if (profile?.image && profile.image !== DEFAULT_IMAGE) {
					if (USE_LOCAL_MEDIA_STORAGE) {
						deleteFile(profile.image).catch((error) => {
							console.log('DELETE USER IMAGE FILE ERROR :>>', error);
						});
					} else if (
						profile.imageStorageInfo &&
						(profile.imageStorageInfo as any).public_id
					) {
						deleteFile((profile.imageStorageInfo as any).public_id).catch(
							(error) => {
								console.log('DELETE USER IMAGE FILE ERROR :>>', error);
							}
						);
					}
				}
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
							create: {
								...employee,
								supervisors: valid.employee.supervisors
									? {
											connect: valid.employee.supervisors.map((id) => ({ id })),
									  }
									: undefined,
							},
							update: {
								...employee,
								supervisors: valid.employee.supervisors
									? {
											set: valid.employee.supervisors.map((id) => ({ id })),
									  }
									: undefined,
							},
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
