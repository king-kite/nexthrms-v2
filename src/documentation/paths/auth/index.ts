import emailResend from './emailResend';
import login from './login';
import logout from './logout';
import profile from './profile';
import register from './register';
import user from './user';

const paths = {
	"/api/auth/register/": register,
	"/api/auth/email/resend/": emailResend,
	"/api/auth/login/": login,
	"/api/auth/logout/": logout,
	"/api/auth/profile/": profile,
	"/api/auth/user/": user,
}

export default paths