import * as routes from '../../../config/server';

import permission from './permission';
import permissions from './permissions';
import exportPermissions from './exportPermissions';

import categories from './categories';

const path = {
	...categories,
	[routes.PERMISSIONS_URL]: permissions,
	[routes.PERMISSION_URL('{id}')]: permission,
	[routes.PERMISSIONS_EXPORT_URL]: exportPermissions,
};

export default path;
