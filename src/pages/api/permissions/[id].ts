import { PERMISSION_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';

export default auth().get(async function (req, res) {
	const response = await axiosJn(req).get(PERMISSION_URL((req.query.id as string).toString()));
	return res.status(200).json(response.data);
});
