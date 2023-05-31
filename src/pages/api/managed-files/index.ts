import { getManagedFiles } from '../../../db';
import { getRecords } from '../../../db/utils';
import { auth } from '../../../middlewares';

export default auth().get(async (req, res) => {
	const result = await getRecords({
		model: 'managed_files',
		perm: 'managedfile',
		query: req.query,
		user: req.user,
		placeholder: {
			total: 0,
			result: [],
		},
		getData(params) {
			return getManagedFiles(params);
		},
	});
	if (result) return res.status(200).json(result);
	return {
		status: 'success',
		message: 'Fetched data successfully',
		data: {
			total: 0,
			result: [],
		},
	};
});
