import { JOBS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { multipleDeleteSchema } from '../../../validators';
import { createJobSchema } from '../../../validators/jobs';
import { getRouteParams } from '../../../validators/pagination';

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(JOBS_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const data = await createJobSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).post(JOBS_URL, data);
		return res.status(201).json(response.data);
	})
	.delete(async function (req, res) {
		const data = await multipleDeleteSchema.validate(
			{
				...req.body,
			},
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req)({
			url: JOBS_URL,
			method: 'DELETE',
			data,
		});
		return res.status(200).json(response.data);
	});
