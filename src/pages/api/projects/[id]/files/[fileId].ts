import { PROJECT_FILE_URL } from '../../../../../config/services';
import { auth } from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';

export default auth().delete(async (req, res) => {
	const url = PROJECT_FILE_URL(req.query.id as string, req.query.fileId as string);

	const response = await axiosJn(req).delete(url);
	return res.status(200).json(response.data);
});
