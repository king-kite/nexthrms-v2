import {
	getPermissionCategories,
	permissionCategorySelectQuery,
	prisma,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import {
	createPermissionCategorySchema,
	validateParams,
} from '../../../../validators';

export default auth()
	.get(async (req, res) => {
		const params = validateParams(req.query);

		const data = await getPermissionCategories(params);

		return res.status(200).json({
			status: 'success',
			message:
				'Fetched permission categories successfully! A total of ' + data.total,
			data,
		});
	})
	.post(async (req, res) => {
		const data: { name: string } =
			await createPermissionCategorySchema.validateAsync(
				{ ...req.body },
				{
					abortEarly: false,
				}
			);

		const category = await prisma.permissionCategory.create({
			data,
			select: permissionCategorySelectQuery,
		});

		return res.status(201).json({
			status: 'success',
			message: 'Permission Category added successfully',
			data: category,
		});
	});
