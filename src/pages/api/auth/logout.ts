import { LOGOUT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { axiosJn } from '../../../utils/axios';
import { removeTokens } from '../../../utils/tokens';

export default auth().post(async function (req, res) {
	const response = await axiosJn(req).post(LOGOUT_URL, {});

	// Remove the tokens
	removeTokens(res);

	return res.status(200).json(response.data);
});
