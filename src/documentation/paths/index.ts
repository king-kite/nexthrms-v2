import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import clients from './clients';
import departments from './departments';
import employees from './employees';
import holidays from './holidays';
import jobs from './jobs';
import notifications from './notifications';
import users from './users';

const paths = {
	...auth,
	...assets,
	...attendance,
	...clients,
	...departments,
	...employees,
	...holidays,
	...jobs,
	...notifications,
	...users
}

export default paths