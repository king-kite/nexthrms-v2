import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid',
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
											$ref: refs.PERMISSION,
										},
									},
								},
							],
						},
					},
				},
			},
			'404': {
				content: {
					'application/json': {
						schema: {
							$ref: refs.BASE,
						},
					},
				},
			},
		},
		summary: 'Get Single Permission',
		tags: [tags.Permissions],
	},
	// put: {
	// 	parameters: [
	// 		{
	// 			in: 'path',
	// 			name: 'id',
	// 			required: true,
	// 			schema: {
	// 				type: 'string',
	// 				format: 'uuid',
	// 			},
	// 		},
	// 	],
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
	// 						codename: {
	// 							required: true,
	// 							type: 'string',
	// 						},
	// 						description: {
	// 							type: 'string',
	// 							nullable: true,
	// 						},
	// 						categoryId: {
	// 							type: 'string',
	// 							format: 'uuid',
	// 							nullable: true,
	// 						},
	// 					},
	// 					example: {
	// 						name: 'can view users',
	// 						codename: 'can_view_users',
	// 						description: 'Permits user to view all users.',
	// 						categoryId: null,
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	responses: {
	// 		...responses,
	// 		'200': {
	// 			content: {
	// 				'application/json': {
	// 					schema: {
	// 						allOf: [
	// 							{ $ref: refs.BASE },
	// 							{
	// 								type: 'object',
	// 								properties: {
	// 									data: {
	// 										$ref: refs.PERMISSION,
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
	// 											codename: {
	// 												nullable: true,
	// 												type: 'string',
	// 											},
	// 											description: {
	// 												type: 'string',
	// 												nullable: true,
	// 											},
	// 											categoryId: {
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
	// 	summary: 'Updated Single Permission',
	// 	tags: [tags.Permissions],
	// },
	// delete: {
	// 	parameters: [
	// 		{
	// 			in: 'path',
	// 			name: 'id',
	// 			required: true,
	// 			schema: {
	// 				type: 'string',
	// 				format: 'uuid',
	// 			},
	// 		},
	// 	],
	// 	responses: {
	// 		...responses,
	// 		'200': {
	// 			content: {
	// 				'application/json': {
	// 					schema: {
	// 						$ref: refs.BASE,
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	summary: 'Delete Single Permission',
	// 	tags: [tags.Permissions],
	// },
};

export default path;
