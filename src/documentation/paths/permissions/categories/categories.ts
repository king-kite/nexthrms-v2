import responses from '../../../responses';
import * as refs from '../../../refs';
import * as tags from '../../../tags';

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
														$ref: refs.PERMISSION_CATEGORY,
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
		summary: 'Get All Permission Categories',
		tags: [tags.Permissions],
	},
	// post: {
	// 	requestBody: {
	// 		required: true,
	// 		content: {
	// 			'application/json': {
	// 				schema: {
	// 					type: 'object',
	// 					properties: {
	// 						name: {
	// 							required: true,
	// 							type: 'string',
	// 						},
	// 					},
	// 					example: {
	// 						name: 'users',
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	responses: {
	// 		...responses,
	// 		'201': {
	// 			content: {
	// 				'application/json': {
	// 					schema: {
	// 						allOf: [
	// 							{ $ref: refs.BASE },
	// 							{
	// 								type: 'object',
	// 								properties: {
	// 									data: {
	// 										$ref: refs.PERMISSION_CATEGORY,
	// 									},
	// 								},
	// 							},
	// 						],
	// 					},
	// 				},
	// 			},
	// 		},
	// 		'400': {
	// 			content: {
	// 				'application/json': {
	// 					schema: {
	// 						allOf: [
	// 							{ $ref: refs.BASE },
	// 							{
	// 								type: 'object',
	// 								properties: {
	// 									error: {
	// 										type: 'object',
	// 										nullable: true,
	// 										properties: {
	// 											name: {
	// 												nullable: true,
	// 												type: 'string',
	// 											},
	// 										},
	// 									},
	// 								},
	// 							},
	// 						],
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	summary: 'Add new permission category',
	// 	tags: [tags.Permissions],
	// },
};

export default path;
