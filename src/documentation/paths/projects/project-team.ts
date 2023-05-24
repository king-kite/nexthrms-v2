import { parametersWithSearch as parameters } from '../../parameters';
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
			...parameters
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
												total: {
													type: 'number'
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.PROJECT_TEAM
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
		summary: 'Get Project Team',
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
			}
		],
		requestBody: {
			required: true,
			content: {
				"application/json": {
					schema: {
						type: 'object',
						properties: {
							team: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										employeeId: {
											type: 'string',
											format: 'uuid'
										},
										isLeader: {
											type: 'boolean'
										}
									}
								}
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
								{$ref: refs.BASE},
								{
									type: 'object',
									properties: {
										data: {
											type: 'array',
											items: {
												$ref: refs.PROJECT_TEAM
											}
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
								{$ref: refs.BASE},
								{
									type: 'object',
									properties: {
										error: {
											type: 'object',
											properties: {
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
		summary: "Create Project Team",
		tags: [tags.Projects]
	}
};

export default path;