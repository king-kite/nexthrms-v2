import login from './login';
import logout from './logout';
import user from './user';

const paths = {
	"/api/auth/login/": login,
	"/api/auth/logout": logout,
	"/api/auth/user/": user,
}

export default paths