import { USER_PERMISSIONS_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { getRouteParams } from '../../../../validators/pagination';
import { updateUserPermissionsSchema } from '../../../../validators/users';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);
		const url = USER_PERMISSIONS_URL((req.query.id as string).toString()) + params;
		const response = await axiosJn(req).get(url);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await updateUserPermissionsSchema.validate({ ...req.body }, { abortEarly: false });

		const response = await axiosJn(req).put(
			USER_PERMISSIONS_URL((req.query.id as string).toString()),
			{
				ids: data.permissions,
			}
		);
		return res.status(200).json(response.data);
	});
