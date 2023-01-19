import { getGroups } from '../../../db';
import { auth } from '../../../middlewares';
import { validateParams } from '../../../validators';

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
	// .post(async (req, res) => {
	// 	const data: CreateGroupQueryType =
	// 		await createGroupSchema.validateAsync(
	// 			{ ...req.body },
	// 			{
	// 				abortEarly: false,
	// 			}
	// 		);

	// 	const group = await prisma.group.create({
	// 		data,
	// 		select: groupSelectQuery,
	// 	});

	// 	return res.status(201).json({
	// 		status: 'success',
	// 		message: 'Group added successfully',
	// 		data: group,
	// 	});
	// });
