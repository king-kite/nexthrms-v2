export const profileProperties = {
	profile: {
		type: 'object',
		nullable: true,
		required: ['image'],
		description: "An object containing the user's profile information",
		properties: {
			image: {
				type: 'object',
				description: "The user's profile image",
				nullable: true,
				properties: {
					id: {
						type: 'string',
						format: 'uuid',
					},
					url: {
						description: "The user's profile image url",
						example: '/images/default.png',
						type: 'string',
					},
				},
			},
			dob: {
				type: 'string',
				nullable: true,
				format: 'date-time',
				description: "The user's date of birth",
			},
			gender: {
				type: 'string',
				nullable: true,
				format: 'MALE | FEMALE',
				description: "The user's date of birth",
			},
			address: {
				type: 'string',
				nullable: true,
				description: "The user's contact address",
			},
			phone: {
				type: 'string',
				nullable: true,
				description: "The user's contact phone number",
			},
			state: {
				type: 'string',
				nullable: true,
				description: "The user's contact state",
			},
			city: {
				type: 'string',
				nullable: true,
				description: "The user's contact city",
			},
		},
	},
};

export const userProperties = {
	email: {
		type: 'string',
		format: 'email',
	},
	firstName: {
		type: 'string',
	},
	lastName: {
		type: 'string',
	},
};

export const userProfileEmployeeProperties = {
	user: {
		type: 'object',
		properties: {
			...userProperties,
			profile: {
				type: 'object',
				nullable: true,
				required: ['image'],
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
					department: {
						type: 'object',
						nullable: true,
						required: ['id', 'name'],
						properties: {
							id: {
								type: 'string',
								format: 'uuid',
							},
							name: {
								type: 'string',
							},
						},
					},
				},
			},
		},
	},
};

export const userEmployeeLeavesProperties = {
	type: 'array',
	items: {
		type: 'object',
		properties: {
			startDate: {
				type: 'string',
				format: 'date-time',
			},
			endDate: {
				type: 'string',
				format: 'date-time',
			},
			reason: {
				type: 'string',
			},
			type: {
				type: 'string',
			},
			approved: {
				type: 'boolean',
			},
		},
	},
};

export const userEmployeeProperties = {
	id: {
		type: 'string',
		format: 'uuid',
	},
	dateEmployed: {
		type: 'string',
		format: 'date-time',
	},
	department: {
		type: 'object',
		nullable: true,
		required: ['name'],
		description: 'Information about the employee department.',
		properties: {
			name: {
				type: 'string',
				description: "The name of the employee's department",
			},
			hod: {
				type: 'object',
				nullable: true,
				description: "Information about the employee's department HOD",
				properties: userProfileEmployeeProperties,
			},
		},
	},
	supervisor: {
		type: 'object',
		nullable: true,
		description: "Information about the employee's supervisor",
		properties: userProfileEmployeeProperties,
	},
	job: {
		type: 'object',
		nullable: true,
		required: ['name'],
		description: 'Information about the employee job.',
		properties: {
			name: {
				type: 'string',
				description: 'The name of the employee job',
			},
		},
	},
	leaves: userEmployeeLeavesProperties,
};

export const userProfileProperties = {
	id: {
		type: 'string',
		format: 'uuid',
	},
	...userProperties,
	...profileProperties,
};
