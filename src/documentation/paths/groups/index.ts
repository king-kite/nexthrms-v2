import * as routes from '../../../config/server';
import * as tags from '../../tags';
import { getExportResponse, getImportResponse } from '../../responses';

import group from './group';
import groups from './groups';

const path = {
	[routes.GROUPS_URL]: groups,
	[routes.GROUP_URL('{id}')]: group,
	[routes.GROUPS_EXPORT_URL]: getExportResponse({
		title: 'Export Groups Data',
		tags: [tags.Groups],
	}),
	[routes.GROUPS_IMPORT_URL]: getImportResponse({
		title: 'Import Groups Data',
		tags: [tags.Groups],
	}),
};

export default path;
