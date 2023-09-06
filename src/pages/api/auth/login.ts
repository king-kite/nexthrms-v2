import { LOGIN_URL } from '../../../config/services';
import handler from '../../../middlewares';
import type { AuthDataType, SuccessResponseType } from '../../../types';
import { axiosJn } from '../../../utils/axios';
import { setTokens } from '../../../utils/tokens';
import { loginSchema } from '../../../validators/auth';

export default handler().post(async function (req, res) {
	const data = await loginSchema.validate(
		{ ...req.body },
		{
			abortEarly: false,
			stripUnknown: true,
		}
	);

	const response = await axiosJn().post<
		SuccessResponseType<{
			tokens?: {
				access: string;
				refresh: string;
			};
			user: AuthDataType;
		}>
	>(LOGIN_URL, data);

	const tokens = response.data.data.tokens;

	// Dont send the tokens to the client;
	delete response.data.data.tokens;

	// Store the access and refresh token
	if (tokens) setTokens(res, tokens.access, tokens.refresh);

	return res.status(200).json(response.data);
});
