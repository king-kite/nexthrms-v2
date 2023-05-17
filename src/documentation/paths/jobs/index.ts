import * as routes from '../../../config/server';
import * as tags from '../../tags';
import { getExportResponse, getImportResponse } from '../../responses';

import job from './job';
import jobs from './jobs';

const path = {
	[routes.JOBS_URL]: jobs,
	[routes.JOB_URL('{id}')]: job,
	[routes.JOBS_EXPORT_URL]: getExportResponse({
		title: 'Export Jobs Data',
		tags: [tags.Jobs],
	}),
	[routes.JOBS_IMPORT_URL]: getImportResponse({
		title: 'Import Jobs Data',
		tags: [tags.Jobs],
	}),
};

export default path;
