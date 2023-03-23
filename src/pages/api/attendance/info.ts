import { getAttendanceInfo } from '../../../db';
import { employee } from '../../../middlewares';

export default employee().get(async (req, res) => {
	const date = req.query.date as string | undefined;
	const data = await getAttendanceInfo(req.user.employee.id, date);

	return res.status(200).json({
		status: 'success',
		message: 'Fetched attendance statistics for this month!',
		data,
	});
});
