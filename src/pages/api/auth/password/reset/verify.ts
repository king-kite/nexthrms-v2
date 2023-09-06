import { PASSWORD_RESET_VERIFY_URL } from '../../../../../config/services';
import handler from '../../../../../middlewares';
import { axiosJn } from '../../../../../utils/axios';
import { verifyUidTokenSchema } from '../../../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await verifyUidTokenSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	const response = await axiosJn().post(PASSWORD_RESET_VERIFY_URL, data);
	return res.status(200).json(response.data);
});
