import { getPermissionCategory } from '../../../../db/queries/permissions';
import { getRecord } from '../../../../db/utils/record';
import { admin } from '../../../../middlewares';
import { PermissionCategoryType } from '../../../../types';
import { NextErrorMessage } from '../../../../utils/classes';

export default admin().get(async (req, res) => {
	const record = await getRecord<PermissionCategoryType | null>({
		model: 'permission_categories',
		perm: 'permissioncategory',
		objectId: req.query.id as string,
		permission: 'VIEW',
		user: req.user,
		getData() {
			return getPermissionCategory(req.query.id as string);
		},
	});

	if (!record) throw new NextErrorMessage(403);

	if (!record.data)
		return res.status(404).json({
			status: 'success',
			message: 'Permission Category with specified ID does not exist!',
		});

	return res.status(200).json({
		status: 'success',
		message: 'Fetched permission category successfully',
		data: record.data,
	});
});
