import { models, permissions } from '../../../../../config';
import { getObjectPermissions } from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { PermissionModelNameType } from '../../../../../types';
import { hasPermission } from '../../../../../utils';
import { NextApiErrorMessage } from '../../../../../utils/classes';

export default auth().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasPermission(req.user.allPermissions, [permissions.permissionobject.VIEW]);

	if (!hasPerm) throw new NextApiErrorMessage(403);

	const modelName = req.query.model as PermissionModelNameType;
	if (!models.includes(modelName))
		return res.status(404).json({
			status: 'error',
			message: 'Permissions for this record does not exist!',
		});

	const objectId = req.query.objectId as string;
	const permission = req.query.permission as
		| ('CREATE' | 'DELETE' | 'EDIT' | 'VIEW')
		| undefined;

	const data = await getObjectPermissions(modelName, objectId, permission);

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
