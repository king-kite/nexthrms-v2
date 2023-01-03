import * as routes from '../../../config/server';

// import job from './job';
import permissions from './permissions';
// import exportJobs from './exportJobs';

const path = {
	[routes.PERMISSIONS_URL]: permissions,
	// [routes.JOB_URL("{id}")]: job,
	// [routes.JOBS_EXPORT_URL]: exportJobs,
};

export default path;
