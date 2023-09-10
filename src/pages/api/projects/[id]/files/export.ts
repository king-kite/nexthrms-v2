import { PROJECT_FILES_EXPORT_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { getRouteParams } from '../../../../../validators/pagination';

export default auth().get(async function (req, res) {
	const params = getRouteParams(req.query);

	const response = await axiosJn(req).get(
		PROJECT_FILES_EXPORT_URL(req.query.id as string) + params
	);
	return res.status(200).json(response.data);
});
