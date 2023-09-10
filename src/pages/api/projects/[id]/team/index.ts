import { PROJECT_TEAM_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { getRouteParams } from '../../../../../validators/pagination';
import { projectTeamCreateSchema } from '../../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);
		const url = PROJECT_TEAM_URL(req.query.id as string) + params;

		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const data = await projectTeamCreateSchema.validate(
			{ ...req.body },
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).post(PROJECT_TEAM_URL(req.query.id as string), data);
		return res.status(201).json(response.data);
	});
