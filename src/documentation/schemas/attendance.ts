export const AttendanceInfoModel = {
	type: 'object',
	properties: {
		date: {
			type: 'string',
			format: 'date-time',
		},
		punchIn: {
			type: 'string',
			format: 'date-time',
		},
		punchOut: {
			type: 'string',
			nullable: true,
			format: 'date-time',
		},
		overtime: {
			nullable: true,
			type: 'object',
			properties: {
				hours: {
					type: 'number',
				},
				status: {
					type: 'string',
					format: "'APPROVED' | 'DENIED' | 'PENDING'",
				},
			},
		},
	},
};

export const AttendanceModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		employee: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
				},
				department: {
					type: 'object',
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
							format: 'email',
							type: 'string',
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
		},
		date: {
			type: 'string',
			format: 'date-time',
		},
		punchIn: {
			type: 'string',
			format: 'date-time',
		},
		punchOut: {
			type: 'string',
			nullable: true,
			format: 'date-time',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
		overtime: {
			nullable: true,
			type: 'object',
			properties: {
				hours: {
					type: 'number',
				},
				reason: {
					type: 'string',
				},
				status: {
					type: 'string',
					format: "'APPROVED' | 'DENIED' | 'PENDING'",
				},
			},
		},
	},
};
