import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import employees from './employees';
import users from './users';

export default {
	...auth,
	...assets,
	...attendance,
	...employees,
	...users
}