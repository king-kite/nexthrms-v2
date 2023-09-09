import { HOLIDAYS_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { multipleDeleteSchema } from '../../../validators';
import { createHolidaySchema } from '../../../validators/holidays';
import { getRouteParams } from '../../../validators/pagination';

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(HOLIDAYS_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const data = await createHolidaySchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).post(HOLIDAYS_URL, data);
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
			url: HOLIDAYS_URL,
			method: 'DELETE',
			data,
		});
		return res.status(200).json(response.data);
	});
