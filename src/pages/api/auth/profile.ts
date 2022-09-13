import { Prisma } from '@prisma/client';

import {
	getProfile,
	prisma,
	profileUserSelectQuery as profileSelect,
} from '../../../db';
import { auth } from '../../../middlewares';
import { ProfileUpdateType } from '../../../types';
import { profileUpdateSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const data = await getProfile(req.user.id);
		if (!data) {
			return res.status(404).json({
				status: 'error',
				message: 'Profile does not exist.!',
			});
		}

		return res.status(200).json({
			status: 'success',
			message: 'Fetched profile successfully!',
			data,
		});
	})
	.put(async (req, res) => {
		const valid: ProfileUpdateType = await profileUpdateSchema.validateAsync({
			...req.body,
		});

		const user = await prisma.user.update({
			where: {
				id: req.user.id,
			},
			data: {
				...valid,
				profile: {
					update: {
						...valid.profile,
					},
				},
			},
			select: profileSelect,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Profile updated successfully!',
			data: user,
		});
	});

const userSelect = {
	firstName: true,
	lastName: true,
	email: true,
	profile: {
		select: {
			image: true,
		},
	},
};
