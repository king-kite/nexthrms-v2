import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'limit',
				required: false,
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'offset',
				required: false,
				schema: {
					type: 'number',
					default: 0,
				},
			},
			{
				in: 'query',
				name: 'search',
				required: false,
				schema: {
					type: 'string',
				},
			},
		],
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
														$ref: refs.HOLIDAY,
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
				description: 'Get All Holidays Information',
			},
		},
		summary: 'Get All Holidays',
		tags: [tags.Holidays],
	},
	post: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							name: {
								type: 'string',
							},
							date: {
								type: 'string',
							},
						},
						example: {
							name: 'New Year\'s Eve',
							date: '2001-03-10T00:00:00.000Z',
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
											$ref: refs.HOLIDAY,
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
												name: {
													type: 'string',
													nullable: true,
												},
												date: {
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
		summary: 'Create new holiday',
		tags: [tags.Holidays],
	},
	delete: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							values: {
								type: 'array',
								items: {
									type: 'string',
									format: 'uuid',
								},
							},
						},
						example: {
							values: [
								'e0c55c26-e5b8-41a2-8269-13881ad7b563',
								'169f1878-88c2-4828-a3de-bc61f9f7d2dd',
							],
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
												values: {
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
		summary: 'Delete Multiple Holidays',
		tags: [tags.Holidays],
	},
};

export default path;
