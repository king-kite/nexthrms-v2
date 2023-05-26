import * as routes from '../../../config/server';
import * as tags from '../../tags';
import { getExportResponse, getImportResponse } from '../../responses';

import leave from './leave';
import leaves from './leaves';
import adminLeave from './admin-leave';
import adminLeaves from './admin-leaves';

const paths = {
	[routes.LEAVES_URL]: leaves,
	[routes.LEAVE_URL('{id}')]: leave,
	[routes.LEAVES_ADMIN_URL]: adminLeaves,
	[routes.LEAVE_ADMIN_URL('{id}')]: adminLeave,
	[routes.LEAVES_ADMIN_EXPORT_URL]: getExportResponse({
		title: 'Export Leaves Data',
		tags: [tags.Leaves],
	}),
	[routes.LEAVES_ADMIN_IMPORT_URL]: getImportResponse({
		title: 'Import Leaves Data',
		tags: [tags.Leaves],
	}),
};

export default paths;
