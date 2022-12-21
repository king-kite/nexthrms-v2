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
		hod: {
			id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
			user: {
				firstName: 'Jan',
				lastName: 'Doe',
				email: 'jandoe@gmail.com',
				profile: {
					image: '/images/default.png',
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
