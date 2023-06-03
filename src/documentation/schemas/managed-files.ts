export const ManagedFileModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		url: {
			type: 'string',
			format: 'uri',
		},
		type: {
			type: 'string',
		},
		size: {
			type: 'number',
		},
		storageInfo: {
			type: 'object',
			properties: {
				location: {
					type: 'string',
					nullable: true,
				},
				public_id: {
					type: 'string',
					nullable: true,
				},
				name: {
					type: 'string',
					nullable: true,
				},
				type: {
					type: 'string',
					nullable: true,
				},
			},
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
							nullable: true,
							type: 'object',
							properties: {
								id: {
									type: 'string',
									format: 'uuid',
								},
								url: {
									type: 'string',
									format: 'uri',
								},
							},
						},
					},
				},
			},
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
};
