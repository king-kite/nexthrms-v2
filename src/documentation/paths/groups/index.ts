import * as routes from '../../../config/server';

import group from './group';
import groups from './groups';
import exportGroups from './exportGroups';

const path = {
	[routes.PERMISSIONS_URL]: groups,
	[routes.PERMISSION_URL('{id}')]: group,
	[routes.PERMISSIONS_EXPORT_URL]: exportGroups,
};

export default path;
