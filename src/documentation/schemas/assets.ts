export const AssetModel = {
	type: 'object',
	required: [
		'assetId',
		'condition',
		'manufacturer',
		'name',
		'purchaseDate',
		'purchaseFrom',
		'serialNo',
		'supplier',
		'status',
		'warranty',
		'value',
	],
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		assetId: {
			type: 'string',
		},
		condition: {
			type: 'string',
			format: "'BAD' | 'GOOD' | 'EXCELLENT'",
		},
		description: {
			type: 'string',
			nullable: true,
		},
		manufacturer: {
			type: 'string',
		},
		model: {
			type: 'string',
			nullable: true,
		},
		name: {
			type: 'string',
		},
		purchaseDate: {
			type: 'string',
			format: 'date-time',
		},
		purchaseFrom: {
			type: 'string',
		},
		serialNo: {
			type: 'string',
		},
		supplier: {
			type: 'string',
		},
		status: {
			type: 'string',
			format: "'APPROVED' | 'DENIED' | 'PENDING' | 'RETURNED'",
		},
		user: {
			type: 'object',
			nullable: true,
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
							type: 'string',
						},
					},
				},
			},
		},
		warranty: {
			type: 'number',
		},
		value: {
			type: 'number',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		assetId: 'AST001',
		condition: 'GOOD',
		description: 'This is the description of this asset.',
		manufacturer: 'AB & D',
		model: 'Sandbox',
		name: 'Printer Max 2',
		purchaseDate: '2022-10-29T00:00:00.000Z',
		purchaseFrom: 'Max & Bims',
		serialNo: '2022fiti112',
		status: 'APPROVED',
		supplier: 'Tim Delivery',
		user: {
			id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
			firstName: 'Jan',
			lastName: 'Doe',
			email: 'jandoe@kitehrms.com',
			profile: {
				image: '/images/default.png',
			},
		},
		warranty: 12,
		value: 400,
	},
};
