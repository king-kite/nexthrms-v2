import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			},
			{
				in: 'query',
				name: 'limit',
				required: false,
				schema: {
					type: 'number',
				}
			},
			{
				in: 'query',
				name: 'offset',
				required: false,
				schema: {
					type: 'number',
				}
			},
			{
				in: 'query',
				name: 'search',
				required: false,
				schema: {
					type: 'string',
				}
			},
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
											type: 'object',
											properties: {
												completed: {
													type: 'number'
												},
												ongoing: {
													type: 'number'
												},
												project: {
													type: 'object',
													properties: {
														id: {
															type: 'string',
															format: 'uuid'
														},
														name: {
															type: 'string'
														}
													}
												},
												total: {
													type: 'number'
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.PROJECT_TASK
													}
												}	
											}
										}
									}
								}
							]
						}
					}
				}
			}
		},
		summary: 'Get Project Tasks',
		tags: [tags.Projects]
	},
	post: {
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			},
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
							dueDate: {
								type: 'string',
								format: 'date-time'
							},
							followers: {
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
						},
						example: {
							name: 'This is the First Task',
							description: 'This is the description of the First Task',
							completed: false,
							dueDate: "2022-12-26T12:31:29.735Z",
							priority: "MEDIUM"
						}
					}
				}
			}
		},
		responses: {
			...responses,
			"201": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.PROJECT_TASK
										}
									}
								}
							]
						}
					}
				}
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										error: {
											type: 'object',
											properties: {
												name: {
													type: 'string',
													nullable: true,
												},
												completed: {
													type: 'string',
													nullable: true,
												},
												message: {
													type: 'string',
													nullable: true
												},
												description: {
													type: 'string',
													nullable: true,
												},
												dueDate: {
													type: 'string',
													nullable: true,
												},
												priority: {
													type: 'string',
													nullable: true
												},
												followers: {
													type: 'string',
													nullable: true
												}
											}
										}
									}
								}
							]
						}
					}
				}
			},
			"404": {
				content: {
					'application/json': {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			}
		},
		summary: 'Create a new Project Task',
		tags: [tags.Projects]
	}
};

export default path;