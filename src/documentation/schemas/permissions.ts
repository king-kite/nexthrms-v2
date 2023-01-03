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
			$ref: PermissionCategoryModel,
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
