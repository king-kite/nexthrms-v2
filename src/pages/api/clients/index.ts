import { Prisma } from '@prisma/client';

import { firebaseBucket, getClients, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { hashPassword } from '../../../utils/bcrypt';
import parseForm from '../../../utils/parseForm';
import { createClientSchema, validateParams } from '../../../validators';

export const config = {
	api: {
		bodyParser: false,
	},
};

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getClients({ ...params });

		return res.status(200).json({
			status: 'success',
			message: 'Fetched clients successfully! A total of ' + data.total,
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
				const splitText = files.image.originalFilename?.split('.');
				const extension = splitText[splitText.length - 1];
				const [obj, file] = await firebaseBucket.upload(files.image.filepath, {
					contentType: files.image.mimetype || undefined,
					destination: `users/profile/${name}.${extension}`,
				});
				valid.contact.profile.image = file.mediaLink;
				Object(valid.contact.profile).imageStorageInfo = {
					name: file.name,
					generation: file.generation,
				};
			} catch (error) {
				if (process.env.NODE_ENV === 'development')
					console.log('FIREBASE CONTACT IMAGE ERROR :>> ', error);
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
