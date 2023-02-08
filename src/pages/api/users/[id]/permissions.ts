import { getUserPermissions, prisma } from '../../../../db';
import { auth } from '../../../../middlewares';
import {
	updateUserPermissionsSchema,
	validateParams,
} from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);
		const data = await getUserPermissions(req.query.id as string, params);

		return res.status(200).json({
			status: 'success',
			message:
				"Fetched user's permissions successfully. A total of " + data.total,
			data,
		});
	})
	.put(async (req, res) => {
		const data: {
			permissions: string[];
		} = await updateUserPermissionsSchema.validateAsync({ ...req.body });

		await prisma.user.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				permissions: {
					set: data.permissions.map((codename) => ({
						codename,
					})),
				},
			},
			select: {
				id: true,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: "User's permissions were updated successfully!",
			data,
		});
	});
