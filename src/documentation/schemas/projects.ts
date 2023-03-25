import { PROJECT_TEAM, PROJECT_TASK_FOLLOWER } from '../refs';

export const ProjectFileModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		file: {
			type: 'string',
			format: 'url',
		},
		size: {
			type: 'number',
		},
		type: {
			type: 'string',
		},
		project: {
			type: 'object',
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
		employee: {
			type: 'object',
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
					},
				},
			},
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
	},
};

export const ProjectTeamModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		isLeader: {
			type: 'boolean',
		},
		employee: {
			type: 'object',
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
							properties: {
								image: {
									type: 'string',
								},
							},
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
			},
		},
	},
};

export const ProjectModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		client: {
			nullable: true,
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
				},
				company: {
					type: 'string',
				},
				position: {
					type: 'string',
				},
				contact: {
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
							properties: {
								image: {
									type: 'string',
								},
							},
						},
					},
				},
			},
		},
		name: {
			type: 'string',
		},
		description: {
			type: 'string',
		},
		completed: {
			type: 'boolean',
		},
		startDate: {
			type: 'string',
			format: 'date-time',
		},
		endDate: {
			type: 'string',
			format: 'date-time',
		},
		initialCost: {
			type: 'number',
		},
		rate: {
			type: 'number',
		},
		priority: {
			type: 'string',
			format: "'HIGH' | 'MEDIUM' | 'LOW'",
		},
		progress: {
			type: 'number',
		},
		team: {
			type: 'array',
			items: {
				$ref: PROJECT_TEAM,
			},
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
	},
};

export const ProjectTaskModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		name: {
			type: 'string',
		},
		description: {
			type: 'string',
		},
		completed: {
			type: 'boolean',
		},
		dueDate: {
			type: 'string',
			format: 'date-time',
		},
		priority: {
			type: 'string',
			format: "'HIGH' | 'MEDIUM' | 'LOW'",
		},
		followers: {
			type: 'array',
			items: {
				$ref: PROJECT_TASK_FOLLOWER,
			},
		},
		project: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'date-time',
				},
				name: {
					type: 'string',
				},
			},
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
	},
};

export const ProjectTaskFollowerModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		isLeader: {
			type: 'boolean',
		},
		member: {
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
									properties: {
										image: {
											type: 'string',
										},
									},
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
					},
				},
			},
		},
	},
};
