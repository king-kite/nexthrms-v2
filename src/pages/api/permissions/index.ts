import { permissions } from '../../../config';
import { getPermissions } from '../../../db';
import { getUserObjects } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { hasModelPermission } from '../../../utils';
import { NextApiErrorMessage } from '../../../utils/classes';
import { validateParams } from '../../../validators';

export default admin().get(async (req, res) => {
	const hasPerm =
		req.user.isSuperUser ||
		hasModelPermission(req.user.allPermissions, [permissions.permission.VIEW]);

	// if the user has model permissions
	if (hasPerm) {
		const params = validateParams(req.query);

		const data = await getPermissions(params);

		return res.status(200).json({
			status: 'success',
			message: 'Fetched permissions successfully! A total of ' + data.total,
			data,
		});
	}

	// If the user has any view object level permissions
	const userObjects = await getUserObjects({
		modelName: 'permissions',
		permission: 'VIEW',
		userId: req.user.id,
	});

	if (userObjects.length > 0) {
		const params = validateParams(req.query);

		const data = await getPermissions({
			...params,
			where: {
				id: {
					in: userObjects.map((obj) => obj.objectId),
				},
			},
		});

		return res.status(200).json({
			status: 'success',
			message: 'Fetched permissions successfully! A total of ' + data.total,
			data,
		});
	}

	throw new NextApiErrorMessage(403);
});
