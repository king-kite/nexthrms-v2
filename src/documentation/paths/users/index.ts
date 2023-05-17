import * as routes from '../../../config/server';
import { getImportResponse } from '../../responses';
import * as tags from '../../tags';

import exportUsers from './export-users';
import userActivation from './user-activation';
import passwordChange from './password-change';
import user from './user'; // Single User Path
import users from './users';
import userGroups from './user-groups';
import userPermissions from './user-permissions';

const paths = {
	[routes.USERS_URL]: users,
	[routes.USER_URL('{id}')]: user,
	[routes.USER_PERMISSIONS_URL('{id}')]: userPermissions,
	[routes.USER_GROUPS_URL('{id}')]: userGroups,
	[routes.CHANGE_USER_PASSWORD_URL]: passwordChange,
	[routes.ACTIVATE_USER_URL]: userActivation,
	[routes.USERS_EXPORT_URL]: exportUsers,
	[routes.USERS_IMPORT_URL]: getImportResponse({
		title: 'Import Users Data',
		tags: [tags.Users],
	}),
};

export default paths;
