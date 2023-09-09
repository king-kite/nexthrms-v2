import { ATTENDANCE_ADMIN_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { attendanceCreateSchema } from '../../../../validators/attendance';
import { getRouteParams } from '../../../../validators/pagination';

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(ATTENDANCE_ADMIN_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const data = await attendanceCreateSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).post(ATTENDANCE_ADMIN_URL, data);
		return res.status(201).json(response.data);
	});
