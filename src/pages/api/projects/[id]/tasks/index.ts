import { PROJECT_TASKS_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { getRouteParams } from '../../../../../validators/pagination';
import { taskCreateSchema } from '../../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(PROJECT_TASKS_URL(req.query.id as string) + params);
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const data = await taskCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).post(PROJECT_TASKS_URL(req.query.id as string), data);
		return res.status(201).json(response.data);
	});
