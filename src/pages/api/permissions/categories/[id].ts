import { permissions } from '../../../../config';
import { getPermissionCategory } from '../../../../db';
import { getUserObjectPermissions } from '../../../../db/utils';
import { admin } from '../../../../middlewares';
import { hasModelPermission } from '../../../../utils';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default admin().get(async (req, res) => {
	let hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.permission.VIEW]);

	if (!hasPerm) {
		// check if the user has a view object permission for this record
		const objPerm = await getUserObjectPermissions({
			modelName: 'permission_categories',
			objectId: req.query.id as string,
			permission: 'VIEW',
			userId: req.user.id,
		});
		if (objPerm.view === true) hasPerm = true;
	}

	if (!hasPerm) throw new NextApiErrorMessage(403);

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
});
