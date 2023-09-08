import { CHANGE_USER_PASSWORD_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { NextErrorMessage } from '../../../../utils/classes';
import { changeUserPasswordSchema } from '../../../../validators/users';

export default auth().post(async (req, res) => {
	if (!req.body.email || !req.body.password1 || !req.body.password2)
		throw new NextErrorMessage(400, "'email', 'password1' and 'password2' fields are required.");
	else if (req.body.password1 !== req.body.password2)
		throw new NextErrorMessage(400, 'Passwords do not match.', {
			password1: 'Passwords do not match',
		});

	const data = await changeUserPasswordSchema.validate({ ...req.body }, { abortEarly: false });

	const response = await axiosJn(req).post(CHANGE_USER_PASSWORD_URL, data);
	return res.status(200).json(response.data);
});
