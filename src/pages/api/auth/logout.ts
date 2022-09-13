import { auth } from '../../../middlewares';
import { removeTokens } from '../../../utils/tokens';

export default auth().post((req, res) => {
	removeTokens(res);
	return res.status(200).json({
		status: 'error',
		message: 'Signed out successfully.',
	});
});
