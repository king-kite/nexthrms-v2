function getSamples(name: string) {
	return {
		link: `/samples/${name}.zip`,
		title: `${name} import file samples.zip`,
	};
}

const samples = {
	assets: getSamples('assets'),
	clients: getSamples('clients'),
	employees: getSamples('employees'),
	groups: getSamples('groups'),
	jobs: getSamples('jobs'),
	projects: getSamples('projects'),
	projectFiles: getSamples('project_files'),
	projectTasks: getSamples('project_tasks'),
	projectTeam: getSamples('project_team'),
	projectTaskFollowers: getSamples('project_task_followers'),
	users: getSamples('users'),
};

export default samples;
