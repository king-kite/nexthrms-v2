import { getPermissionCategories } from '../../../../db/queries/permissions';
import { getRecords } from '../../../../db/utils/record';
import { admin } from '../../../../middlewares';
import { PermissionCategoryType } from '../../../../types';
import { NextApiErrorMessage } from '../../../../utils/classes';

export default admin().get(async (req, res) => {
	const result = await getRecords<{
		total: number;
		result: PermissionCategoryType[];
	}>({
		model: 'permission_categories',
		perm: 'permissioncategory',
		query: req.query,
		user: req.user,
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getPermissionCategories(params);
		},
	});

	if (result) return res.status(200).json(result);

	throw new NextApiErrorMessage(403);
});
