import { getPermission } from '../../../db/queries/permissions';
import { getRecord } from '../../../db/utils/record';
import { admin } from '../../../middlewares';
import { PermissionType } from '../../../types';
import { NextErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const record = await getRecord<PermissionType | null>({
		model: 'permissions',
		perm: 'permission',
		permission: 'VIEW',
		objectId: req.query.id as string,
		user: req.user,
		getData() {
			return getPermission(req.query.id as string);
		},
	});

	if (!record) throw new NextErrorMessage(403);

	if (!record.data)
		return res.status(404).json({
			status: 'success',
			message: 'Permission with specified ID does not exist!',
		});

	return res.status(200).json({
		status: 'success',
		message: 'Fetched permission successfully',
		data: record.data,
	});
});
