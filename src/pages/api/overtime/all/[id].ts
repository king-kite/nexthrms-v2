import { OVERTIME_DETAIL_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { overtimeCreateSchema } from '../../../../validators/overtime';

export default auth()
	.get(async (req, res) => {
		const response = await axiosJn(req).get(OVERTIME_DETAIL_URL(req.query.id as string));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await overtimeCreateSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).put(OVERTIME_DETAIL_URL(req.query.id as string), data);
		return res.status(200).json(response.data);
	})
	.delete(async (req, res) => {
		const response = await axiosJn(req).delete(OVERTIME_DETAIL_URL(req.query.id as string));
		return res.status(200).json(response.data);
	});
