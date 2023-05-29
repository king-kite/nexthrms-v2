import * as refs from '../refs';

// Object Permissions
export const PermissionObjectModel = {
	type: 'object',
	properties: {
		users: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					firstName: {
						type: 'string',
					},
					lastName: {
						type: 'string',
					},
					email: {
						type: 'string',
						format: 'email',
					},
					profile: {
						type: 'object',
						nullable: true,
						properties: {
							image: {
								type: 'object',
								nullable: true,
								properties: {
									id: {
										type: 'string',
										format: 'uuid',
									},
									url: {
										type: 'string',
									},
								},
							},
						},
					},
				},
			},
		},
		permission: {
			type: 'string',
			format: '(DELETE | EDIT | VIEW)',
		},
		groups: {
			type: 'array',
			items: {
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
			},
		},
	},
};

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
