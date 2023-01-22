import { getGroup, groupSelectQuery, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { CreateGroupQueryType } from '../../../types';
import { createGroupSchema } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const data = await getGroup(req.query.id as string);

		if (!data)
			return res.status(404).json({
				status: 'success',
				message: 'Group with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched group successfully',
			data,
		});
	})
	.put(async (req, res) => {
		const data: CreateGroupQueryType =
			await createGroupSchema.validateAsync(
				{ ...req.body },
				{ abortEarly: false }
			);

		const group = await prisma.group.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: groupSelectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Group updated successfully!',
			data: group,
		});
	})
	.delete(async (req, res) => {
		await prisma.group.delete({
			where: {
				id: req.query.id as string,
			},
		});
		return res.status(200).json({
			status: 'success',
			message: 'Group deleted successfully!',
		});
	});
