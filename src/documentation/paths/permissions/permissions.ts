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
			{
				in: 'query',
				name: 'all',
				required: false,
				schema: {
					type: 'number',
					default: 1,
					description:
						'Fetch all permissions from the database. Enter 0 for false or 1 for true.',
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
														$ref: refs.PERMISSION,
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
		summary: 'Get All Permissions',
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
	// 							type: 'string',
	// 						},
	// 					},
	// 					example: {
	// 						name: 'Web Application Developer',
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
	// 										$ref: refs.JOB,
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
	// 												type: 'string',
	// 												nullable: true,
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
	// 	summary: 'Create new job',
	// 	tags: [tags.Jobs],
	// },
};

export default path;
