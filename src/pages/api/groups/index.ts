import { getGroups, groupSelectQuery, prisma } from '../../../db';
import { auth } from '../../../middlewares';
import { CreateGroupQueryType } from '../../../types';
import { createGroupSchema, validateParams } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getGroups(params);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched groups successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const data: CreateGroupQueryType = await createGroupSchema.validateAsync(
			{ ...req.body },
			{
				abortEarly: false,
			}
		);

		const group = await prisma.group.create({
			data: {
				name: data.name,
				description: data.description,
				active: data.active,
				permissions: data.permissions
					? {
							connect: data.permissions.map((codename) => ({ codename })),
					  }
					: undefined,
				users: data.users
					? {
							connect: data.users.map((id) => ({ id })),
					  }
					: undefined,
			},
			select: groupSelectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Group added successfully',
			data: group,
		});
	});
