import {
	getLeave,
	prisma,
	leaveSelectQuery as selectQuery,
} from '../../../../db';
import { auth } from '../../../../middlewares';
import { leaveCreateSchema } from '../../../../validators';
import { CreateLeaveQueryType } from '../../../../types';

export default auth()
	.get(async (req, res) => {
		const leave = getLeave(req.query.id as string);
		// TODO: Check Permissions

		return res.status(200).json({
			status: 'success',
			message: 'Fetched leave successfully!',
			data: leave,
		});
	})
	.delete(async (req, res) => {
		// TODO: Check leave status is still pending

		await prisma.leave.delete({ where: { id: req.query.id as string } });

		return res.status(200).json({
			status: 'success',
			message: 'Leave deleted successfully',
		});
	});
