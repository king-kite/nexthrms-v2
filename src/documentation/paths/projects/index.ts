import * as routes from '../../../config/server';

import projects from './projects';
import exportProjects from './exportProjects';

const paths = {
	[routes.PROJECTS_URL]: projects,
	[routes.PROJECTS_EXPORT_URL]: exportProjects,
}

export default paths;