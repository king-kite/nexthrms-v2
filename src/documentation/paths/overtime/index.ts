import * as routes from '../../../config/server';
import * as tags from '../../tags';
import { getExportResponse, getImportResponse } from '../../responses';

import singleOvertime from './overtime';
import allOvertime from './all-overtime';
import adminOvertime from './admin-overtime';
import adminAllOvertime from './admin-all-overtime';

const paths = {
	[routes.OVERTIME_URL]: allOvertime,
	[routes.OVERTIME_DETAIL_URL('{id}')]: singleOvertime,
	[routes.OVERTIME_ADMIN_URL]: adminAllOvertime,
	[routes.OVERTIME_ADMIN_DETAIL_URL('{id}')]: adminOvertime,
	[routes.OVERTIME_ADMIN_EXPORT_URL]: getExportResponse({
		title: 'Export Overtime Data',
		tags: [tags.Overtime],
	}),
	[routes.OVERTIME_ADMIN_EXPORT_URL]: getImportResponse({
		title: 'Import Overtime Data',
		tags: [tags.Overtime],
	}),
};

export default paths;
