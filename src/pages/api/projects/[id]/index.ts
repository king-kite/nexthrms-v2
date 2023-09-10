import { PROJECT_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { projectCreateSchema } from '../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const response = await axiosJn(req).get(PROJECT_URL(req.query.id as string));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await projectCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).put(PROJECT_URL(req.query.id as string), data);
		return res.status(200).json(response.data);
	})
	.delete(async (req, res) => {
		const response = await axiosJn(req).delete(PROJECT_URL(req.query.id as string));
		return res.status(200).json(response.data);
	});
