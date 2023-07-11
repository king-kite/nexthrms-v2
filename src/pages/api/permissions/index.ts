import { getPermissions } from '../../../db/queries/permissions';
import { getRecords } from '../../../db/utils/record';
import { admin } from '../../../middlewares';
import { PermissionType } from '../../../types';
import { NextErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const result = await getRecords<{
		total: number;
		result: PermissionType[];
	}>({
		model: 'permissions',
		perm: 'permission',
		query: req.query,
		user: req.user,
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getPermissions(params);
		},
	});

	if (result) return res.status(200).json(result);

	throw new NextErrorMessage(403);
});
