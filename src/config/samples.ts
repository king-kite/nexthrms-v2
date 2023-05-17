function getSamples(name: string) {
	return {
		link: `/samples/${name}.zip`,
		title: `${name} import file samples.zip`,
	};
}

const samples = {
	assets: getSamples('assets'),
	groups: getSamples('groups'),
	users: getSamples('users'),
};

export default samples;
