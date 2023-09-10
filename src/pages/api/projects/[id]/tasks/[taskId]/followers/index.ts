import { PROJECT_TASK_FOLLOWERS_URL } from '../../../../../../../config/services';
import { auth } from '../../../../../../../middlewares';
import { axiosJn } from '../../../../../../../utils/axios';
import { getRouteParams } from '../../../../../../../validators/pagination';
import { projectTaskFollowersCreateSchema } from '../../../../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);
		const url =
			PROJECT_TASK_FOLLOWERS_URL(req.query.id as string, req.query.taskId as string) + params;

		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const data = await projectTaskFollowersCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const url = PROJECT_TASK_FOLLOWERS_URL(req.query.id as string, req.query.taskId as string);

		const response = await axiosJn(req).post(url, data);
		return res.status(201).json(response.data);
	});
