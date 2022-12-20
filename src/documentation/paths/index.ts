import auth from './auth';
import assets from './assets';
import employees from './employees';
import users from './users';

export default {
	...auth,
	...assets,
	...employees,
	...users
}