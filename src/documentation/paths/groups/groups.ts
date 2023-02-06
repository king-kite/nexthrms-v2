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
														$ref: refs.GROUP,
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
		summary: 'Get All Groups',
		tags: [tags.Groups],
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
								required: true,
								type: 'string',
							},
							active: {
								required: false,
								type: 'boolean',
							},
							description: {
								nullable: true,
								type: 'string',
								required: false,
							},
							permissions: {
								required: true,
								type: 'array',
								items: {
									type: 'string',
									format: 'uuid',
								},
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
											$ref: refs.GROUP,
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
													nullable: true,
													type: 'string',
												},
												active: {
													nullable: true,
													type: 'string',
												},
												description: {
													nullable: true,
													type: 'string',
												},
												permissions: {
													nullable: true,
													type: 'string',
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
		summary: 'Add new group',
		tags: [tags.Groups],
	},
};

export default path;
