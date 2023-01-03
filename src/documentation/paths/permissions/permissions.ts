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
							codename: {
								required: true,
								type: 'string',
							},
							description: {
								type: 'string',
								nullable: true,
							},
							categoryId: {
								type: 'string',
								format: 'uuid',
								nullable: true,
							},
						},
						example: {
							name: 'can view users',
							codename: 'can_view_users',
							description: 'Permits user to view all users.',
							categoryId: null,
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
											$ref: refs.PERMISSION,
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
												codename: {
													nullable: true,
													type: 'string',
												},
												description: {
													type: 'string',
													nullable: true,
												},
												categoryId: {
													type: 'string',
													format: 'uuid',
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
		summary: 'Add new permission',
		tags: [tags.Permissions],
	},
};

export default path;
