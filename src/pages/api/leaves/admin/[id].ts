import { LEAVE_ADMIN_URL as LEAVE_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { leaveApprovalSchema, leaveCreateSchema } from '../../../../validators/leaves';

export default auth()
	.get(async (req, res) => {
		const response = await axiosJn(req).get(LEAVE_URL(req.query.id as string));
		return res.status(200).json(response.data);
	})
	.post(async (req, res) => {
		const data = await leaveApprovalSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).post(LEAVE_URL(req.query.id as string), data);
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const data = await leaveCreateSchema.validate(
			{
				...req.body,
			},
			{ abortEarly: false, stripUnknown: true }
		);

		const response = await axiosJn(req).put(LEAVE_URL(req.query.id as string), data);
		return res.status(200).json(response.data);
	})
	.delete(async (req, res) => {
		const response = await axiosJn(req).delete(LEAVE_URL(req.query.id as string));
		return res.status(200).json(response.data);
	});
