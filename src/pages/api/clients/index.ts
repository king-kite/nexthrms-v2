import { Prisma } from '@prisma/client';

import { permissions } from '../../../config';
import { clientSelectQuery, getClients, prisma } from '../../../db';
import { addObjectPermissions, getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { ClientType, GetClientsResponseType } from '../../../types';
import { hasModelPermission } from '../../../utils';
import { hashPassword } from '../../../utils/bcrypt';
import { NextApiErrorMessage } from '../../../utils/classes';
import { upload as uploadFile } from '../../../utils/files';
import parseForm from '../../../utils/parseForm';
import { createClientSchema } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default admin()
	.get(async (req, res) => {
		const result = await getRecords<GetClientsResponseType['data']>({
			model: 'clients',
			perm: 'client',
			query: req.query,
			user: req.user,
			placeholder: {
				total: 0,
				inactive: 0,
				active: 0,
				result: [],
			},
			getData(params) {
				return getClients(params);
			},
		});

		if (result) return res.status(200).json(result);

		throw new NextApiErrorMessage(403);
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

		const client = (await prisma.client.create({
			data,
			select: clientSelectQuery,
		})) as unknown as ClientType;

		if (client)
			await Promise.all([
				// Set the object permissions
				await addObjectPermissions({
					model: 'clients',
					objectId: client.id,
					userId: req.user.id,
				}),
				await addObjectPermissions({
					model: 'users',
					objectId: client.contact.id,
					userId: req.user.id,
				}),
			]);

		return res.status(201).json({
			status: 'success',
			message: 'Client created successfully',
			data: client,
		});
	});
