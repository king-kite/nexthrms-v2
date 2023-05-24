import * as routes from '../../../config/server';
import { getExportResponse, getImportResponse } from '../../responses';
import * as tags from '../../tags';

import employee from './employee'; // Single Employee
import employees from './employees';

const paths = {
	[routes.EMPLOYEES_URL]: employees,
	[routes.EMPLOYEE_URL('{id}')]: employee,
	[routes.EMPLOYEES_EXPORT_URL]: getExportResponse({
		parameters: [
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0,
				},
			},
		],
		tags: [tags.Employees],
		title: 'Export Employees Data',
	}),
	[routes.EMPLOYEES_IMPORT_URL]: getImportResponse({
		tags: [tags.Employees],
		title: 'Import Employees Data',
	}),
};

export default paths;
