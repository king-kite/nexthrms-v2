import { MANAGED_FILE_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { NextErrorMessage } from '../../../utils/classes';

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(MANAGED_FILE_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const name = req.body.name;
		if (!name || typeof name !== 'string')
			throw new NextErrorMessage(400, 'name field is required and must be a string.');

		const response = await axiosJn(req).put(MANAGED_FILE_URL((req.query.id as string).toString()), {
			name,
		});
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(
			MANAGED_FILE_URL((req.query.id as string).toString())
		);
		return res.status(200).json(response.data);
	});
