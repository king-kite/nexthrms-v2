import { getAttendanceInfo } from '../../../db';
import { auth } from '../../../middlewares';

export default auth().get(async (req, res) => {
	if (!req.user.employee) {
		return res.status(403).json({
			status: 'error',
			message: 'Only employees can get attendance records.',
		});
	}

	const data = await getAttendanceInfo(req.user.employee.id);

	return res.status(200).json({
		status: 'success',
		message: 'Fetched attendance statistics for this month!',
		data,
	});
});
