import { auth } from '../../../middlewares';
import { serializeUserData } from '../../../utils/serializers';

export default auth().get(async (req, res) => {
	const data = await serializeUserData(req.user);

	return res.status(200).json({
		message: 'Verified successfully',
		status: 'success',
		data,
	});
});
