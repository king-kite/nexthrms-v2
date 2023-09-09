import { LEAVES_ADMIN_URL as LEAVES_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { getRouteParams } from '../../../../validators';
import { leaveCreateSchema } from '../../../../validators/leaves';

export default auth()
	.get(async (req, res) => {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(LEAVES_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const data = await leaveCreateSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).post(LEAVES_URL, data);
		return res.status(201).json(response.data);
	});
