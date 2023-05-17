import { PermissionModelChoices } from '@prisma/client';

function getSamples(name: string) {
	return {
		link: `/samples/${name}.zip`,
		title: `${name} import file samples.zip`,
	};
}

const names: PermissionModelChoices[] = ['assets', 'groups', 'users'];

const samples = names.reduce((acc, name) => {
	return {
		...acc,
		[name]: getSamples(name),
	};
}, {});

// const samples = {
// 	assets: getSamples('assets'),
// 	groups: getSamples('groups'),
// 	users: getSamples('users'),
// };

export default samples;
