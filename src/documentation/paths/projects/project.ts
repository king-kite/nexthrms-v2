import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.PROJECT,
										}
									}
								}
							],
						},
					},
				},
				description: "Get Single Project Information",
			},
			"404": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			}
		},
		summary: "Get Single Project",
		tags: [tags.Projects],
	},
	put: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
		requestBody: {
			required: true,
			content: {
				"application/json": {
					schema: {
						type: 'object',
						properties: {
							name: {
								type: 'string'
							},
							description: {
								type: 'string'
							},
							priority: {
								type: 'string',
								format: "'HIGH' | 'MEDIUM' | 'LOW'"
							},
							initialCost: {
								type: 'number'
							},
							rate: {
								type: 'number'
							},
							startDate: {
								type: 'string',
								format: 'date-time'
							},
							endDate: {
								type: 'string',
								format: 'date-time'
							},
							client: {
								type: 'string',
								format: 'uuid'
							},
							team: {
								description: "Send in an empty array to delete all team members. To retain old team, do not send this field",
								type: 'array',
								nullable: true,
								items: {
									type: 'object',
									properties: {
										isLeader: {
											type: 'boolean'
										},
										employeeId: {
											type: 'string',
											format: 'uuid'
										}
									}
								}
							},
							completed: {
								type: 'boolean',
								nullable: true,
							}
						}
					}
				}
			}
		},
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: "object",
									properties: {
										data: {
											$ref: refs.PROJECT,
										},
									},
								},
							],
						},
					},
				},
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: "object",
									properties: {
											error: {
											type: 'object',
											properties: {
												name: {
													type: 'string',
													nullable: true,
												},
												client: {
													type: 'string',
													nullable: true,
												},
												completed: {
													type: 'string',
													nullable: true,
												},
												description: {
													type: 'string',
													nullable: true,
												},
												startDate: {
													type: 'string',
													nullable: true,
												},
												endDate: {
													type: 'string',
													nullable: true,
												},
												initialCost: {
													type: 'string',
													nullable: true,
												},
												rate: {
													type: 'string',
													nullable: true
												},
												priority: {
													type: 'string',
													nullable: true
												},
												team: {
													type: 'string',
													nullable: true
												}
											}
										}
									},
								},
							],
						},
					},
				},
			},
		},
		summary: "Updated Single Project",
		tags: [tags.Projects],
	},
	delete: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			}
		},
		summary: "Delete Single Project",
		tags: [tags.Projects]
	}
};

export default path;
