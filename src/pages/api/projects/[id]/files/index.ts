import { getFiles } from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { validateParams } from '../../../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);
	const files = await getFiles({ ...params, id: req.query.id as string });

	return res.status(200).json({
		status: 'success',
		message: 'Fetched project files successfully',
		data: files,
	});
});
