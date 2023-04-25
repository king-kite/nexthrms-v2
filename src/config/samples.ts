function getSamples(name: string) {
	return {
		link: `/samples/${name}.zip`,
		title: `${name} import file samples.zip`,
	};
}

const samples = {
	assets: getSamples('assets'),
};

export default samples;
