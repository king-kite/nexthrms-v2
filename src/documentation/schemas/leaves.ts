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
};

export const LeaveModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		type: {
			type: 'string',
			format:
				"'ANNUAL' | 'CASUAL' | 'HOSPITALIZATION' | 'LOP' | 'MATERNITY' | 'PATERNITY' | 'SICK'",
		},
		startDate: {
			type: 'string',
			format: 'date-time',
		},
		endDate: {
			type: 'string',
			foramt: 'date-time',
		},
		reason: {
			type: 'string',
		},
		status: {
			type: 'string',
			format: "'APPROVED' | 'DENIED' | 'PENDING'",
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
