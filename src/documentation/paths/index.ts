import auth from './auth';
import employees from './employees';
import users from './users';

export default {
	...auth,
	...employees,
	...users
}