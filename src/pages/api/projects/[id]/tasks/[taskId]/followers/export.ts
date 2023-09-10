import { PROJECT_TASK_FOLLOWERS_EXPORT_URL } from '../../../../../../../config/services';
import { auth } from '../../../../../../../middlewares';
import { axiosJn } from '../../../../../../../utils/axios';
import { getRouteParams } from '../../../../../../../validators/pagination';

export default auth().get(async function (req, res) {
	const params = getRouteParams(req.query);

	const response = await axiosJn(req).get(
		PROJECT_TASK_FOLLOWERS_EXPORT_URL(req.query.id as string, req.query.taskId as string) + params
	);
	return res.status(200).json(response.data);
});
