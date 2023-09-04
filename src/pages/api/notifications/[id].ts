import axios from 'axios';

import { NOTIFICATION_URL } from '../../../config/services';
import handler from '../../../middlewares';

export default handler()
	.get(async function (req, res) {
		const response = await axios.get(NOTIFICATION_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	})
	.put(async (req, res) => {
		const { read } = req.body;

		const response = await axios.put(NOTIFICATION_URL((req.query.id as string).toString()), {
			read: !!read,
		});
		return res.status(200).json(response.data);
	})
	.delete(async function (req, res) {
		const response = await axios.delete(NOTIFICATION_URL((req.query.id as string).toString()));
		return res.status(200).json(response.data);
	});
