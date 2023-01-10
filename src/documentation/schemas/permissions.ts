import * as refs from '../refs';

export const PermissionCategoryModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
	},
};

export const PermissionModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		category: {
			$ref: refs.PERMISSION_CATEGORY,
			nullable: true,
		},
		codename: {
			type: 'string',
		},
		description: {
			nullable: true,
			type: 'string',
		},
	},
};
