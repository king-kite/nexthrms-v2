import { auth } from '../../../middlewares';
import { serializeUserData } from '../../../utils/serializers';

export default auth().get((req, res) => {
	const data = serializeUserData(req.user);

	return res.status(200).json({
		message: 'Verified successfully',
		status: 'success',
		data,
	});
});
