import { getPermission } from '../../../db';
import { auth } from '../../../middlewares';

export default auth()
	.get(async (req, res) => {
		const data = await getPermission(req.query.id as string);

		if (!data)
			return res.status(404).json({
				status: 'success',
				message: 'Permission with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched permission successfully',
			data,
		});
	})
	// .put(async (req, res) => {
	// 	const data: CreatePermissionQueryType =
	// 		await createPermissionSchema.validateAsync(
	// 			{ ...req.body },
	// 			{ abortEarly: false }
	// 		);

	// 	const permission = await prisma.permission.update({
	// 		where: {
	// 			id: req.query.id as string,
	// 		},
	// 		data,
	// 		select: permissionSelectQuery,
	// 	});

	// 	return res.status(200).json({
	// 		status: 'success',
	// 		message: 'Permission updated successfully!',
	// 		data: permission,
	// 	});
	// })
	// .delete(async (req, res) => {
	// 	await prisma.permission.delete({
	// 		where: {
	// 			id: req.query.id as string,
	// 		},
	// 	});
	// 	return res.status(200).json({
	// 		status: 'success',
	// 		message: 'Permission deleted successfully!',
	// 	});
	// });
