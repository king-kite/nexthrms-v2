import * as routes from '../../../config/server';

import project from './project';
import projects from './projects';
import exportProjects from './exportProjects';

import projectFiles from './projectFiles';

const paths = {
	[routes.PROJECTS_URL]: projects,
	[routes.PROJECT_URL("{id}")]: project,
	[routes.PROJECTS_EXPORT_URL]: exportProjects,

	[routes.PROJECT_FILES_URL("{projectId}")]: projectFiles,
}

export default paths;