function getSamples(name: string) {
	return {
		link: `/samples/${name}.zip`,
		title: `${name} import file samples.zip`,
	};
}

const samples = {
	assets: getSamples('assets'),
	clients: getSamples('clients'),
	groups: getSamples('groups'),
	jobs: getSamples('jobs'),
	users: getSamples('users'),
};

export default samples;
