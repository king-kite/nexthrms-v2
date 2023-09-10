import { PROJECTS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { getRouteParams } from '../../../validators/pagination';
import { projectCreateSchema } from '../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(PROJECTS_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const data = await projectCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).post(PROJECTS_URL, data);
		return res.status(201).json(response.data);
	});
