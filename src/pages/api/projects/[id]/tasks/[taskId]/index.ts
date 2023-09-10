import { PROJECT_TASK_URL } from '../../../../../../config/services';
import { auth } from '../../../../../../middlewares';
import { axiosJn } from '../../../../../../utils/axios';
import { taskCreateSchema } from '../../../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const response = await axiosJn(req).get(
			PROJECT_TASK_URL(req.query.id as string, req.query.taskId as string)
		);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await taskCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).put(
			PROJECT_TASK_URL(req.query.id as string, req.query.taskId as string),
			data
		);
		return res.status(200).json(response.data);
	})
	.delete(async (req, res) => {
		const response = await axiosJn(req).delete(
			PROJECT_TASK_URL(req.query.id as string, req.query.taskId as string)
		);
		return res.status(200).json(response.data);
	});
