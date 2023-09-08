import { USER_GROUPS_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { getRouteParams } from '../../../../validators/pagination';
import { updateUserGroupsSchema } from '../../../../validators/users';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);
		const url = USER_GROUPS_URL((req.query.id as string).toString()) + params;
		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await updateUserGroupsSchema.validate({ ...req.body }, { abortEarly: false });

		const response = await axiosJn(req).put(USER_GROUPS_URL((req.query.id as string).toString()), {
			ids: data.groups,
		});
		return res.status(200).json(response.data);
	});
