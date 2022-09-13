import { Prisma } from '@prisma/client';

import { prisma, getClient } from '../../../db';
import { auth } from '../../../middlewares';
import { createClientSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
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
		const valid = await createClientSchema.validateAsync({ ...req.body });

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
					connect: {
						id: valid.contactId,
					},
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
