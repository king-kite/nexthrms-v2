import { getPermissions } from '../../../db';
import { getRecords } from '../../../db/utils';
import { admin } from '../../../middlewares';
import { PermissionType } from '../../../types';
import { NextApiErrorMessage } from '../../../utils/classes';

export default admin().get(async (req, res) => {
	const result = await getRecords<{
		total: number;
		result: PermissionType[];
	}>({
		model: 'users',
		perm: 'user',
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

	throw new NextApiErrorMessage(403);
});
