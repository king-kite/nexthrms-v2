import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import clients from './clients';
import departments from './departments';
import employees from './employees';
import users from './users';

const paths = {
	...auth,
	...assets,
	...attendance,
	...clients,
	...departments,
	...employees,
	...users
}

export default paths