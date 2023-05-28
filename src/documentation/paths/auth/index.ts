import * as routes from '../../../config/server';

import emailConfirm from './email-confirm';
import emailResend from './email-resend';
import login from './login';
import logout from './logout';
import objectPermission from './object-permission';
import passwordChange from './password-change';
import passwordConfirm from './password-confirm';
import passwordReset from './password-reset';
import passwordVerify from './password-verify';
import profile from './profile';
import register from './register';
import user from './user';

const paths = {
	[routes.REGISTER_URL]: register,
	[routes.EMAIL_RESEND_URL]: emailResend,
	[routes.EMAIL_CONFIRM_URL]: emailConfirm,
	[routes.PASSWORD_RESET_URL]: passwordReset,
	[routes.PASSWORD_RESET_VERIFY_URL]: passwordVerify,
	[routes.PASSWORD_RESET_CONFIRM_URL]: passwordConfirm,
	[routes.PASSWORD_CHANGE_URL]: passwordChange,
	[routes.LOGIN_URL]: login,
	[routes.LOGOUT_URL]: logout,
	[routes.USER_DATA_URL]: user,
	[routes.PROFILE_URL]: profile,
	[routes.USER_OBJECT_PERMISSIONS_URL('{modelName}' as any, '{objectId}')]:
		objectPermission,
};

export default paths;
