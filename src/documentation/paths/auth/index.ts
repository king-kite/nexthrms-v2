import login from './login';
import logout from './logout';
import register from './register';
import user from './user';

const paths = {
	"/api/auth/register/": register,
	"/api/auth/login/": login,
	"/api/auth/logout/": logout,
	"/api/auth/user/": user,
}

export default paths