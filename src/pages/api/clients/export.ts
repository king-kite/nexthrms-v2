import { CLIENTS_EXPORT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { getRouteParams } from '../../../validators/pagination';

export default auth().get(async function (req, res) {
	const params = getRouteParams(req.query);

	const response = await axiosJn(req).get(CLIENTS_EXPORT_URL + params);
	return res.status(200).json(response.data);
});
