import { getGroupUserRouteParams } from '.';
import { GROUP_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { createGroupSchema } from '../../../validators/users';

export default auth()
	.get(async function (req, res) {
		const url = GROUP_URL((req.query.id as string).toString());
		const params = getGroupUserRouteParams(req.query);
		const response = await axiosJn(req).get(url + '?' + params);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await createGroupSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).put(GROUP_URL((req.query.id as string).toString()), data);
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(GROUP_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
