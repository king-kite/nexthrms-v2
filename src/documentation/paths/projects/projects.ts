import { parametersWithSearch as parameters } from '../../parameters';
import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters,
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
												total: {
													type: 'number'
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.PROJECT
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
		summary: 'Get Projects',
		tags: [tags.Projects]
	},
	post: {
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
											$ref: refs.PROJECT
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
									}
								}
							]
						}
					}
				}
			}
		},
		summary: 'Create a new Project',
		tags: [tags.Projects]
	}
};

export default path;