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
				in: 'path',
				name: 'memberId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
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
								{$ref: refs.BASE},
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.PROJECT_TEAM
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
		summary: 'Get Single Project Team Member',
		tags: [tags.Projects]
	},
	put: {
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
				in: 'path',
				name: 'memberId',
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
							team: {
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
		},
		responses: {
			responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{$ref: refs.BASE},
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.PROJECT_TEAM
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
												employeeId: {
													type: 'string',
													nullable: true
												},
												isLeader: {
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
		}
		},
		summary: "Update Project Team Member",
		tags: [tags.Projects],
	},
	delete: {
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
				in: 'path',
				name: 'memberId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			},
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
		summary: "Delete/Remove Project Team Member",
		tags: [tags.Projects],
	},
};

export default path;