import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import clients from './clients';
import departments from './departments';
import employees from './employees';
import holidays from './holidays';
import users from './users';

const paths = {
	...auth,
	...assets,
	...attendance,
	...clients,
	...departments,
	...employees,
	...holidays,
	...users
}

export default paths