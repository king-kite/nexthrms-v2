import {
	prisma,
	getPermissionCategory,
	permissionCategorySelectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { createPermissionCategorySchema } from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const data = await getPermissionCategory(req.query.id as string);

		if (!data)
			return res.status(404).json({
				status: 'success',
				message: 'Permission Category with specified ID does not exist!',
			});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched permission category successfully',
			data,
		});
	})
	.put(async (req, res) => {
		const data: { name: string } =
			await createPermissionCategorySchema.validateAsync(
				{ ...req.body },
				{ abortEarly: false }
			);

		const category = await prisma.permissionCategory.update({
			where: {
				id: req.query.id as string,
			},
			data,
			select: permissionCategorySelectQuery,
		});

		return res.status(200).json({
			status: 'success',
			message: 'Permission category updated successfully!',
			data: category,
		});
	})
	.delete(async (req, res) => {
		await prisma.permissionCategory.delete({
			where: {
				id: req.query.id as string,
			},
		});
		return res.status(200).json({
			status: 'success',
			message: 'Permission category deleted successfully!',
		});
	});
