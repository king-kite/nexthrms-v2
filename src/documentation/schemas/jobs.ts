export const JobModel = {
	type: 'object',
	required: ['name'],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		name: 'Accountant',
	},
};
