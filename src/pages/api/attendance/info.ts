import { getAttendanceInfo } from '../../../db/queries/attendance';
import { employee } from '../../../middlewares';
import { validateParams } from '../../../validators/pagination';

export default employee().get(async (req, res) => {
	const { date } = validateParams(req.query);
	const data = await getAttendanceInfo(req.user.employee.id, date);

	return res.status(200).json({
		status: 'success',
		message: 'Fetched attendance statistics for this month!',
		data,
	});
});
