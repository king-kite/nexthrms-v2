import * as routes from '../../../config/server';

import job from './job';
import jobs from './jobs';
import exportJobs from './exportJobs';

const path = {
    [routes.JOBS_URL]: jobs,
    [routes.JOB_URL("{id}")]: job,
    [routes.JOBS_EXPORT_URL]: exportJobs,
};

export default path;