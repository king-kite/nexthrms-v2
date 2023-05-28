import * as refs from '../refs';

export const GroupModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		description: {
			nullable: true,
			type: 'string',
		},
		active: {
			nullable: true,
			type: 'boolean',
		},
		permissions: {
			type: 'array',
			items: {
				$ref: refs.PERMISSION,
			},
		},
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
					isActive: {
						type: 'boolean',
					},
					profile: {
						type: 'object',
						nullable: true,
						properties: {
							image: {
								type: 'object',
								nullable: true,
								properties: {
									url: {
										example: '/images/default.png',
										type: 'string',
									},
								},
							},
						},
					},
				},
			},
		},
		_count: {
			type: 'object',
			required: false,
			nullable: true,
			properties: {
				users: {
					type: 'number',
				},
			},
		},
	},
};
