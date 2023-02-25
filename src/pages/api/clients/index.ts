import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import { getClients, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { hasModelPermission } from '../../../utils';
import { hashPassword } from '../../../utils/bcrypt';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createClientSchema, validateParams } from '../../../validators';

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

		const params = validateParams(req.query);

		const data = await getClients({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched clients successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const hasPerm =
			req.user.isSuperUser ||
			hasModelPermission(req.user.allPermissions, [permissions.client.CREATE]);

		if (!hasPerm) throw new NextApiErrorMessage(403);

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

		const valid = await createClientSchema.validateAsync(form, {
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
					console.log('CONTACT IMAGE ERROR :>> ', error);
			}
		}

		const contact: Prisma.UserCreateNestedOneWithoutClientInput = valid.contact
			? {
					create: {
						...valid.contact,
						email: valid.contact.email.toLowerCase(),
						password: await hashPassword(valid.contact.lastName.toUpperCase()),
						profile: {
							create: valid.contact.profile,
						},
					},
			  }
			: {
					connect: {
						id: valid.contactId,
					},
			  };

		const data: Prisma.ClientCreateInput = {
			position: valid.position,
			company: valid.company,
			contact,
		};

		const client = await prisma.client.create({
			data,
			select: selectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Client created successfully',
			data: client,
		});
	});

const selectQuery: Prisma.ClientSelect = {
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
