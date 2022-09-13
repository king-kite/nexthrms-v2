import { auth } from '../../../middlewares';

export default auth().get((req, res) => {
	return res.status(200).json({
		message: 'Verified successfully',
		status: 'success',
	});
});
