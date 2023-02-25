import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import { prisma, getClient } from '../../../db';
import { auth } from '../../../middlewares';
import { ClientCreateQueryType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createClientSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.client.VIEW]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

		const data = await getClient(req.query.id as string);

		if (!data)
			return res.status(404).json({
				status: 'success',
				message: 'Client with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched client successfully',
			data,
		});
	})
	.put(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.client.EDIT]);

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

		const valid: ClientCreateQueryType = await createClientSchema.validateAsync(
			form,
			{ abortEarly: false }
		);

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
				const location = `media/users/profile/${name}`;
				const result = await uploadFile({
					file: files.image,
					location,
					type: 'image',
				});
				valid.contact.profile.image = result.secure_url || result.url;
				Object(valid.contact.profile).imageStorageInfo = {
					id: result.public_id,
					name: result.original_filename,
					type: result.resource_type,
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

		return res.status(200).json({
			status: 'success',
			message: 'Client updated successfully!',
			data: client,
		});
	})
	.delete(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.client.DELETE]);

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

const select = {
	id: true,
	company: true,
	contact: {
		select: {
			firstName: true,
			lastName: true,
			email: true,
			profile: {
				select: {
					image: true,
					gender: true,
					city: true,
					address: true,
					dob: true,
					phone: true,
					state: true,
				},
			},
			isActive: true,
		},
	},
	position: true,
};
