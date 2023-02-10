import { getUserGroups, prisma } from '../../../../db';
import { auth } from '../../../../middlewares';
import { updateUserGroupsSchema, validateParams } from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);
		const data = await getUserGroups(req.query.id as string, params);

		return res.status(200).json({
			status: 'success',
			message: "Fetched user's groups successfully. A total of " + data.total,
			data,
		});
	})
	.put(async (req, res) => {
		const data: {
			groups: string[];
		} = await updateUserGroupsSchema.validateAsync({ ...req.body });

		await prisma.user.update({
			where: {
				id: req.query.id as string,
			},
			data: {
				groups: {
					set: data.groups.map((id) => ({ id })),
				},
			},
			select: {
				id: true,
			},
		});

		return res.status(200).json({
			status: 'success',
			message: "User's groups were updated successfully!",
		});
	});
