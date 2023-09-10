import { PROJECT_TEAM_MEMBER_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { projectTeamMemberUpdateSchema } from '../../../../../validators/projects';

export default auth()
	.get(async (req, res) => {
		const url = PROJECT_TEAM_MEMBER_URL(req.query.id as string, req.query.teamId as string);

		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const url = PROJECT_TEAM_MEMBER_URL(req.query.id as string, req.query.teamId as string);

		const data = await projectTeamMemberUpdateSchema.validate(
			{ ...req.body },
			{ abortEarly: false }
		);

		const response = await axiosJn(req).put(url, data);
		return res.status(200).json(response.data);
	})
	.delete(async (req, res) => {
		const url = PROJECT_TEAM_MEMBER_URL(req.query.id as string, req.query.teamId as string);

		const response = await axiosJn(req).delete(url);
		return res.status(200).json(response.data);
	});
