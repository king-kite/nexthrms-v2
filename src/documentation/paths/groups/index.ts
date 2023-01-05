import * as routes from '../../../config/server';

import group from './group';
import groups from './groups';
import exportGroups from './exportGroups';

const path = {
	[routes.GROUPS_URL]: groups,
	[routes.GROUP_URL('{id}')]: group,
	[routes.GROUPS_EXPORT_URL]: exportGroups,
};

export default path;
