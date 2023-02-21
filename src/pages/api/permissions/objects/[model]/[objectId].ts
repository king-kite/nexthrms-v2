import { models, permissions } from '../../../../../config';
import { getObjectPermissions } from '../../../../../db';
import { admin } from '../../../../../middlewares';
import { PermissionModelNameType } from '../../../../../types';
import { hasPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasPermission(req.user.allPermissions, [permissions.permissionobject.VIEW]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	const modelName = req.query.model as PermissionModelNameType;
	if (!models.includes(modelName))
		return res.status(404).json({
			status: 'error',
			message: 'Permissions for this record do not exist!',
		});

	const objectId = req.query.objectId as string;
	const permission = req.query.permission as
		| ('CREATE' | 'DELETE' | 'EDIT' | 'VIEW')
		| undefined;

	const {
		groupLimit,
		groupOffset,
		groupSearch,
		userLimit,
		userOffset,
		userSearch,
	} = req.query;

	const groupsPaginated = groupLimit || groupOffset || groupSearch;
	const usersPaginated = userLimit || userOffset || userSearch;

	const groups = groupsPaginated
		? {
				limit: groupLimit && !isNaN(+groupLimit) ? +groupLimit : undefined,
				offset: groupOffset && !isNaN(+groupOffset) ? +groupOffset : undefined,
				search: groupSearch as string,
		  }
		: undefined;

	const users = usersPaginated
		? {
				limit: userLimit && !isNaN(+userLimit) ? +userLimit : undefined,
				offset: userOffset && !isNaN(+userOffset) ? +userOffset : undefined,
				search: userSearch as string,
		  }
		: undefined;

	const options =
		groupsPaginated || usersPaginated
			? {
					groups,
					users,
			  }
			: undefined;

	const data = await getObjectPermissions(
		modelName,
		objectId,
		permission,
		options
	);

	return res.status(200).json({
		status: 'success',
		message: 'Fetched all permissions for this record successfully!',
		data,
	});
});
// .post(async (req, res) => {
// 	const data: { name: string } =
// 		await createPermissionCategorySchema.validateAsync(
// 			{ ...req.body },
// 			{
// 				abortEarly: false,
// 			}
// 		);

// 	const category = await prisma.permissionCategory.create({
// 		data,
// 		select: permissionCategorySelectQuery,
// 	});

// 	return res.status(201).json({
// 		status: 'success',
// 		message: 'Permission Category added successfully',
// 		data: category,
// 	});
// });
