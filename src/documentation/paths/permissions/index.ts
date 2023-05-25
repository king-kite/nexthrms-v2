import * as routes from '../../../config/server';
import { getExportResponse, getImportResponse } from '../../responses';
import * as tags from '../../tags';

import objectPermissions from './objects';
import permission from './permission';
import permissions from './permissions';

import categories from './categories';

const path = {
	...categories,
	[routes.PERMISSIONS_URL]: permissions,
	[routes.PERMISSION_URL('{id}')]: permission,
	[routes.PERMISSIONS_EXPORT_URL]: getExportResponse({
		description: 'Export Permissions and Object Level Data',
		title: 'Export Permissions',
		tags: [tags.Permissions],
	}),
	[routes.PERMISSIONS_IMPORT_URL]: getImportResponse({
		description: 'Import Permissions and Object Level data',
		title: 'Import Permissions',
		tags: [tags.Permissions],
	}),
	[routes.OBJECT_PERMISSIONS_URL('{modelName}' as any, '{objectId}')]:
		objectPermissions,
};

export default path;
