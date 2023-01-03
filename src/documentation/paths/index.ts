import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import clients from './clients';
import departments from './departments';
import employees from './employees';
import holidays from './holidays';
import jobs from './jobs';
import leaves from './leaves';
import notifications from './notifications';
import overtime from './overtime';
import permissions from './permissions';
import projects from './projects';
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
	...leaves,
	...notifications,
	...overtime,
	...permissions,
	...projects,
	...users
}

export default paths