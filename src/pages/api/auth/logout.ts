import axios from 'axios';

import { LOGOUT_URL } from '../../../config/services';
import { auth } from '../../../middlewares';
import { getToken, removeTokens } from '../../../utils/tokens';

export default auth().post(async function (req, res) {
	const response = await axios.post(
		LOGOUT_URL,
		{},
		{
			headers: {
				accept: 'application/json',
				authorization: 'Bearer ' + getToken(req, 'access'),
				'content-type': 'application/json',
			},
		}
	);

	// Remove the tokens
	removeTokens(res);

	return res.status(200).json(response.data);
});
