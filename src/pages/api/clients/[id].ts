import { Prisma } from '@prisma/client';

import { permissions, MEDIA_PROFILE_URL } from '../../../config';
import prisma from '../../../db';
import {
	getClient,
	clientSelectQuery as select,
} from '../../../db/queries/clients';
import {
	getRecord,
	getUserObjectPermissions,
	updateObjectPermissions,
} from '../../../db/utils';
import { admin } from '../../../middlewares';
import { ClientType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createClientSchema } from '../../../validators/clients';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		const record = await getRecord<ClientType | null>({
			model: 'clients',
			perm: 'client',
			objectId: req.query.id as string,
			permission: 'VIEW',
			user: req.user,
			getData() {
				return getClient(req.query.id as string);
			},
		});

		if (!record) throw new NextApiErrorMessage(403);

		if (!record.data)
			return res.status(404).json({
				status: 'success',
				message: 'Client with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched client successfully',
			data: record.data,
		});
	})
	.put(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.client.EDIT]);

		if (!hasPerm) {
			// check if the user has an edit object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'clients',
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

		const valid = await createClientSchema.validate(form, {
			abortEarly: false,
		});

		if (valid.contactId && valid.contact) {
			return res.status(400).json({
				status: 'error',
				message:
					"Invalid data! Provide either a 'contactId' or 'contact' object ",
			});
		} else if (!valid.contactId && !valid.contact) {
			return res.status(400).json({
				status: 'error',
				message: "Invalid data! Provide a 'contactId' or 'contact' object.",
			});
		}

		if (valid.contact && files.image) {
			// Upload a file to the bucket using firebase admin
			try {
				const name = (
					valid.contact.firstName +
					'_' +
					valid.contact.lastName +
					'_' +
					valid.contact.email
				).toLowerCase();
				const location = MEDIA_PROFILE_URL + name;
				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});

				Object(valid.contact.profile).image = {
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
					console.log('CONTACT UPDATE IMAGE ERROR :>> ', error);
			}
		}

		const contact: {
			update?: Prisma.UserUpdateInput;
			connect?: { id: string };
		} = valid.contact
			? {
					update: {
						...valid.contact,
						email: valid.contact.email.toLowerCase(),
						profile: {
							update: {
								...valid.contact.profile,
								image: valid.contact.profile.image
									? {
											upsert: {
												create: valid.contact.profile.image as any,
												update: valid.contact.profile.image as any,
											},
									  }
									: undefined,
							},
						},
					},
			  }
			: {
					connect: valid.contactId
						? {
								id: valid.contactId,
						  }
						: undefined,
			  };

		const client = await prisma.client.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				position: valid.position,
				company: valid.company,
				contact,
			},
			select,
		});

		if (valid.contact && files.image && client.contact.profile?.image) {
			// set managed files permissions
			await updateObjectPermissions({
				model: 'managed_files',
				objectId: client.contact.profile.image.id,
				users: [req.user.id, client.contact.id],
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Client updated successfully!',
			data: client,
		});
	})
	.delete(async (req, res) => {
		let hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.client.DELETE]);

		if (!hasPerm) {
			// check if the user has a delete object permission for this record
			const objPerm = await getUserObjectPermissions({
				modelName: 'clients',
				objectId: req.query.id as string,
				permission: 'DELETE',
				userId: req.user.id,
			});
			if (objPerm.delete === true) hasPerm = true;
		}

		if (!hasPerm) throw new NextApiErrorMessage(403);

		await prisma.client.delete({
			where: {
				id: req.query.id as string,
			},
		});
		return res.status(200).json({
			status: 'success',
			message: 'Client deleted successfully!',
		});
	});
