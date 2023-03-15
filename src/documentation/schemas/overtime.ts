const employeeModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		department: {
			type: 'object',
			nullable: true,
			properties: {
				name: {
					type: 'string',
				},
			},
		},
		job: {
			type: 'object',
			nullable: true,
			properties: {
				name: {
					type: 'string',
				},
			},
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
							type: 'string',
						},
					},
				},
			},
		},
	},
};

export const OvertimeModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		type: {
			type: 'string',
			format: "'COMPULSORY' | 'HOLIDAY' | 'VOLUNTARY'",
		},
		date: {
			type: 'string',
			format: 'date-time',
		},
		hours: {
			type: 'number',
		},
		reason: {
			type: 'string',
		},
		status: {
			type: 'string',
			format: "'APPROVED' | 'DENIED' | 'EXPIRED' | 'PENDING'",
		},
		updatedAt: {
			type: 'string',
			foramt: 'date-time',
		},
		createdAt: {
			type: 'string',
			foramt: 'date-time',
		},
		employee: employeeModel,
		approvedBy: {
			nullable: true,
			...employeeModel,
		},
		createdBy: {
			nullable: true,
			...employeeModel,
		},
	},
};
