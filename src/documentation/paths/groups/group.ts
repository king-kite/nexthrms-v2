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
			{
				in: 'query',
				name: 'userLimit',
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'userOffset',
				schema: {
					type: 'number',
					default: 0,
				},
			},
			{
				in: 'query',
				name: 'userFrom',
				schema: {
					type: 'string',
					format: 'date-time',
				},
			},
			{
				in: 'query',
				name: 'userTo',
				schema: {
					type: 'string',
					format: 'date-time',
					default: new Date().toLocaleDateString('en-Ca'),
				},
			},
			{
				in: 'query',
				name: 'userSearch',
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
											$ref: refs.GROUP,
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
		summary: 'Get Single Group',
		tags: [tags.Groups],
	},
	put: {
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
								type: 'array',
								items: {
									type: 'string',
									description: 'The permission code e.g. can_view_user',
								},
							},
							users: {
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
												users: {
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
		summary: 'Updated Single Group',
		tags: [tags.Groups],
	},
	delete: {
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
							$ref: refs.BASE,
						},
					},
				},
			},
		},
		summary: 'Delete Single Group',
		tags: [tags.Groups],
	},
};

export default path;
