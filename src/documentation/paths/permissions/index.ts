import * as routes from '../../../config/server';

import permission from './permission';
import permissions from './permissions';
// import exportJobs from './exportJobs';

const path = {
	[routes.PERMISSIONS_URL]: permissions,
	[routes.PERMISSION_URL('{id}')]: permission,
	// [routes.JOBS_EXPORT_URL]: exportJobs,
};

export default path;
