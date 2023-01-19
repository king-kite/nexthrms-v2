import { getPermissions } from '../../../db';
import { auth } from '../../../middlewares';
import { validateParams } from '../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getPermissions(params);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched permissions successfully! A total of ' + data.total,
			data,
		});
	})
	// .post(async (req, res) => {
	// 	const data: CreatePermissionQueryType =
	// 		await createPermissionSchema.validateAsync(
	// 			{ ...req.body },
	// 			{
	// 				abortEarly: false,
	// 			}
	// 		);

	// 	const permission = await prisma.permission.create({
	// 		data,
	// 		select: permissionSelectQuery,
	// 	});

	// 	return res.status(201).json({
	// 		status: 'success',
	// 		message: 'Permission added successfully',
	// 		data: permission,
	// 	});
	// });
