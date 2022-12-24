export const ProjectTeamModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid'
		},
		isLeader: {
			type: 'boolean'
		},
		employee: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					format: 'uuid'
				},
				user: {
					type: 'object',
					properties: {
						firstName: {
							type: 'string'
						},
						lastName: {
							type: 'string'
						},
						email: {
							type: 'string',
							format: 'email'
						},
						profile: {
							type: 'object',
							properties: {
								image: {
									type: 'image'
								}
							}
						}
					}
				},
				job: {
					type: 'object',
					nullable: true,
					properties: {
						name: {
							type: 'string'
						}
					}
				}
			}
		}
	}
}

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
					format: 'uuid'
				},
				company: {
					type: 'string'
				},
				position: {
					type: 'string'
				},
				contact: {
					type: 'object',
					properties: {
						firstName: {
							type: 'string'
						},
						lastName: {
							type: 'string'
						},
						email: {
							type: 'string',
							format: 'email'
						},
						profile: {
							type: 'object',
							properties: {
								image: {
									type: 'image'
								}
							}
						}
					}
				}
			}
		},
		name: {
			type: 'string'
		},
		description: {
			type: 'string'
		},
		completed: {
			type: 'boolean'
		},
		startDate: {
			type: 'string',
			format: 'date-time'
		},
		endDate: {
			type: 'string',
			format: 'date-time'
		},
		initialCost: {
			type: 'number'
		},
		rate: {
			type: 'number'
		},
		priority: {
			type: 'string',
			format: "'HIGH' | 'MEDIUM' | 'LOW'"
		},
		progress: {
			type: 'number'
		},
		team: {
			type: 'array',
			items: {
				$ref: ProjectTeamModel
			}
		},
		updatedAt: {
			type: 'string',
			format: 'date-time'
		}
	}
}
