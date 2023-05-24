export const HolidayModel = {
	type: 'object',
	required: ['name', 'date'],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		date: {
			type: 'string',
			format: 'date-time',
		},
		createdAt: {
			required: false,
			type: 'string',
			format: 'date-time',
		},
		updatedAt: {
			required: false,
			type: 'string',
			format: 'date-time',
		},
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		name: 'New Year',
		date: '2001-03-10T00:00:00.000Z',
		createdAt: '2001-03-10T00:00:00.000Z',
		updatedAt: '2001-03-10T00:00:00.000Z',
	},
};
