import { parametersWithSearch as parameters } from '../../parameters';
import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters,
		responses: {
			...responses,
			'200': {
				content: {
					'application/json': {
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
													type: 'number',
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.MANAGED_FILE,
													},
												},
											},
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: 'Get All Files',
		tags: [tags.ManagedFiles],
	},
	post: {
		requestBody: {
			required: true,
			content: {
				'multipart/form-data': {
					schema: {
						type: 'object',
						required: ['name', 'type'],
						properties: {
							file: {
								nullable: true,
								required: false,
								type: 'string',
								format: 'base64',
							},
							name: {
								type: 'string',
							},
							directory: {
								type: 'string',
							},
							type: {
								type: 'string',
								format: 'file | folder',
							},
						},
					},
				},
			},
		},
		responses: {
			...responses,
			'201': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.MANAGED_FILE,
										},
									},
								},
							],
						},
					},
				},
			},
			'400': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										error: {
											type: 'object',
											nullable: true,
											properties: {
												file: {
													type: 'string',
													nullable: true,
												},
												name: {
													type: 'string',
													nullable: true,
												},
												type: {
													type: 'string',
													nullable: true,
												},
												directory: {
													type: 'string',
													nullable: true,
												},
											},
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: 'Create new file or folder',
		tags: [tags.ManagedFiles],
	},
	delete: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							files: {
								nullable: true,
								type: 'array',
								items: {
									type: 'string',
									format: 'uuid',
								},
							},
							folder: {
								nullable: true,
								type: 'string',
								example: 'users/profile/',
							},
						},
					},
				},
			},
		},
		responses: {
			...responses,
			'200': {
				content: {
					'application/json': {
						schema: {
							$ref: refs.BASE,
						},
					},
				},
			},
			'400': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										error: {
											type: 'object',
											nullable: true,
											properties: {
												files: {
													type: 'string',
													nullable: true,
												},
												folder: {
													type: 'string',
													nullable: true,
												},
											},
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: 'Delete multiple files',
		tags: [tags.ManagedFiles],
	},
};

export default path;
