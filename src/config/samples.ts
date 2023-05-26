function getSamples(name: string) {
	return {
		link: `/samples/${name}.zip`,
		title: `${name} import file samples.zip`,
	};
}

const samples = {
	assets: getSamples('assets'),
	attendance: getSamples('attendance'),
	clients: getSamples('clients'),
	departments: getSamples('departments'),
	employees: getSamples('employees'),
	groups: getSamples('groups'),
	holiday: getSamples('holiday'),
	jobs: getSamples('jobs'),
	leaves: getSamples('leaves'),
	overtime: getSamples('overtime'),
	permissions: getSamples('permissions'),
	projects: getSamples('projects'),
	projectFiles: getSamples('project_files'),
	projectTasks: getSamples('project_tasks'),
	projectTeam: getSamples('project_team'),
	projectTaskFollowers: getSamples('project_task_followers'),
	users: getSamples('users'),
};

export default samples;
