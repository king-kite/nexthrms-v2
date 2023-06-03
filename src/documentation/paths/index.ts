import auth from './auth';
import assets from './assets';
import attendance from './attendance';
import clients from './clients';
import departments from './departments';
import employees from './employees';
import groups from './groups';
import holidays from './holidays';
import jobs from './jobs';
import leaves from './leaves';
import managed_files from './managed-files';
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
	...managed_files,
	...groups,
	...holidays,
	...jobs,
	...leaves,
	...notifications,
	...overtime,
	...permissions,
	...projects,
	...users,
};

export default paths;
