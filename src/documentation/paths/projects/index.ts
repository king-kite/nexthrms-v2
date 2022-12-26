import * as routes from '../../../config/server';

import project from './project';
import projects from './projects';
import exportProjects from './exportProjects';

import projectFile from './projectFile';
import projectFiles from './projectFiles';

import projectTeam from './projectTeam';
import projectTeamMember from './projectTeamMember';

import projectTask from './projectTask';
import projectTasks from './projectTasks';

const paths = {
	[routes.PROJECTS_URL]: projects,
	[routes.PROJECT_URL("{id}")]: project,
	[routes.PROJECTS_EXPORT_URL]: exportProjects,

	[routes.PROJECT_FILES_URL("{projectId}")]: projectFiles,
	[routes.PROJECT_FILE_URL("{projectId}", "{projectFileId}")]: projectFile,

	[routes.PROJECT_TEAM_URL("{projectId}")]: projectTeam,
	[routes.PROJECT_TEAM_MEMBER_URL("{projectId}", "{memberId}")]: projectTeamMember,

	[routes.PROJECT_TASKS_URL("{projectId}")]: projectTasks,
	[routes.PROJECT_TASK_URL("{projectId}", "{taskId}")]: projectTask,
}

export default paths;