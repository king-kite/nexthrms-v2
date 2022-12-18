import { auth } from '../../../middlewares';
import { AuthDataType } from '../../../types';

export default auth().get((req, res) => {
	const data: AuthDataType = {
		firstName: req.user.firstName,
		lastName: req.user.lastName,
		fullName: req.user.fullName,
		email: req.user.email,
		profile: req.user.profile
			? {
					image: req.user.profile.image,
			  }
			: null,
		employee: null,
	};
	if (req.user.employee) {
		data.employee = {
			id: req.user.employee.id,
		};
		if (req.user.employee.job) {
			data.employee.job = {
				name: req.user.employee.job.name,
			};
		}
	}

	return res.status(200).json({
		message: 'Verified successfully',
		status: 'success',
		data,
	});
});
