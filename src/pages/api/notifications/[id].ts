import axios from 'axios';

import { NOTIFICATION_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';

export default auth()
	.get(async function (req, res) {
		const response = await axiosJn(req).get(NOTIFICATION_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const { read } = req.body;

		const response = await axiosJn(req).put(NOTIFICATION_URL((req.query.id as string).toString()), {
			read: !!read,
		});
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axiosJn(req).delete(
			NOTIFICATION_URL((req.query.id as string).toString())
		);
		return res.status(200).json(response.data);
	});
