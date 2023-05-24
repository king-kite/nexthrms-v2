import * as routes from '../../../config/server';
import { getExportResponse, getImportResponse } from '../../responses';
import * as tags from '../../tags';

import department from './department';
import departments from './departments';

const path = {
	[routes.DEPARTMENTS_URL]: departments,
	[routes.DEPARTMENT_URL('{id}')]: department,
	[routes.DEPARTMENTS_EXPORT_URL]: getExportResponse({
		title: 'Export Departments Data',
		tags: [tags.Departments],
	}),
	[routes.DEPARTMENTS_IMPORT_URL]: getImportResponse({
		title: 'Import Department Data',
		tags: [tags.Departments],
	}),
};

export default path;
