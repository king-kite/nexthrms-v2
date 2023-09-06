import { PASSWORD_CHANGE_URL } from '../../../../config/services';
import { auth } from '../../../../middlewares';
import { axiosJn } from '../../../../utils/axios';
import { NextErrorMessage } from '../../../../utils/classes';
import { passwordChangeSchema } from '../../../../validators/auth';

export default auth().post(async function (req, res) {
	const data = await passwordChangeSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	if (data.newPassword1 !== data.newPassword2)
		throw new NextErrorMessage(400, 'Passwords do not match');

	const response = await axiosJn(req).post(PASSWORD_CHANGE_URL, data);
	return res.status(200).json(response.data);
});
