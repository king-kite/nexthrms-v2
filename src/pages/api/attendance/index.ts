import { ATTENDANCE_URL, ATTENDANCE_INFO_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { attendanceActionSchema } from '../../../validators/attendance';
import { getRouteParams } from '../../../validators/pagination';

export default auth()
	.get(async function (req, res) {
		const params = getRouteParams(req.query);

		const response = await axiosJn(req).get(ATTENDANCE_URL + params);
		return res.status(200).json(response.data);
	})
	.post(async function (req, res) {
		const data = await attendanceActionSchema.validate({ ...req.body });

		const response = await axiosJn(req).post(ATTENDANCE_INFO_URL, data);
		return res.status(200).json(response.data);
	});
