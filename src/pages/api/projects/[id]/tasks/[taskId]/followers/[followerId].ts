import { PROJECT_TASK_FOLLOWER_URL } from '../../../../../../../config/services';
import { auth } from '../../../../../../../middlewares';
import { axiosJn } from '../../../../../../../utils/axios';
import { projectTaskFollowerUpdateSchema } from '../../../../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const url = PROJECT_TASK_FOLLOWER_URL(
			req.query.id as string,
			req.query.taskId as string,
			req.query.followerId as string
		);

		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const url = PROJECT_TASK_FOLLOWER_URL(
			req.query.id as string,
			req.query.taskId as string,
			req.query.followerId as string
		);

		const data = await projectTaskFollowerUpdateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).put(url, data);
		return res.status(200).json(response.data);
	})
	.delete(async (req, res) => {
		const url = PROJECT_TASK_FOLLOWER_URL(
			req.query.id as string,
			req.query.taskId as string,
			req.query.followerId as string
		);

		const response = await axiosJn(req).delete(url);
		return res.status(200).json(response.data);
	});
