import { USER_DATA_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';

export default auth().get(async function (req, res) {
	const response = await axiosJn(req).get(USER_DATA_URL);
	return res.status(200).json(response.data);
});
