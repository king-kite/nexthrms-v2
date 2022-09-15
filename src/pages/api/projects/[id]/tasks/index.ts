import { getProjectTasks } from '../../../../../db';
import { auth } from '../../../../../middlewares';
import { validateParams } from '../../../../../validators';

export default auth().get(async (req, res) => {
	const params = validateParams(req.query);
	const tasks = await getProjectTasks({
		...params,
		id: req.query.id as string,
	});

	return res.status(200).json({
		status: 'success',
		message: 'Fetched tasks successfully',
		data: tasks,
	});
});
