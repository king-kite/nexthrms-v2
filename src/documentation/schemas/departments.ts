export const DepartmentModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		updatedAt: {
			required: false,
			type: 'string',
			format: 'date-time',
		},
		createdAt: {
			required: false,
			type: 'string',
			format: 'date-time',
		},
		hod: {
			type: 'object',
			nullable: true,
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
				},
				user: {
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
						employee: {
							type: 'object',
							nullable: true,
							properties: {
								job: {
									nullable: true,
									type: 'object',
									properties: {
										name: {
											type: 'string',
										},
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
			properties: {
				employees: {
					type: 'number',
				},
			},
		},
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		name: 'Administration',
		createdAt: '2022-11-28T14:53:40.800Z',
		updatedAt: '2022-11-28T14:53:40.800Z',
		hod: {
			id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
			user: {
				firstName: 'Jan',
				lastName: 'Doe',
				email: 'jandoe@kitehrms.com',
				profile: {
					image: {
						id: '12345678-5678-1234-12345678',
						url: '/images/default.png',
					},
				},
			},
			employee: {
				job: {
					name: 'Human Resource Manager',
				},
			},
		},
		_count: {
			employee: 12,
		},
	},
};
