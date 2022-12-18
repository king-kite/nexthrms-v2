import * as routes from "../../../config/server";

import emailConfirm from "./emailConfirm";
import emailResend from "./emailResend";
import login from "./login";
import logout from "./logout";
import passwordReset from './passwordReset';
import passwordVerify from './passwordVerify';
import profile from "./profile";
import register from "./register";
import user from "./user";

const paths = {
	[routes.REGISTER_URL]: register,
	[routes.EMAIL_RESEND_URL]: emailResend,
	[routes.EMAIL_CONFIRM_URL]: emailConfirm,
	[routes.PASSWORD_RESET_URL]: passwordReset,
	[routes.PASSWORD_RESET_VERIFY_URL]: passwordVerify,
	[routes.LOGIN_URL]: login,
	[routes.LOGOUT_URL]: logout,
	[routes.USER_DATA_URL]: user,
	[routes.PROFILE_URL]: profile,
};

export default paths;
