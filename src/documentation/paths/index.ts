import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import clients from './clients';
import employees from './employees';
import users from './users';

const paths = {
	...auth,
	...assets,
	...attendance,
	...clients,
	...employees,
	...users
}

export default paths