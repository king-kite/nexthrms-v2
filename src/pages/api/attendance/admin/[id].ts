import { ATTENDANCE_ADMIN_SINGLE_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { attendanceCreateSchema } from '../../../../validators/attendance';

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(
			ATTENDANCE_ADMIN_SINGLE_URL((req.query.id as string).toString())
		);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await attendanceCreateSchema.validate(
			{ ...req.body },
			{
				abortEarly: false,
				stripUnknown: true,
			}
		);

		const response = await axiosJn(req).put(
			ATTENDANCE_ADMIN_SINGLE_URL((req.query.id as string).toString()),
			data
		);
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(
			ATTENDANCE_ADMIN_SINGLE_URL((req.query.id as string).toString())
		);
		return res.status(200).json(response.data);
	});
