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
	},
};
