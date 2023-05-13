import { parametersWithSearch as parameters } from '../../parameters';
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
				name: 'limit',
				schema: {
					type: 'number',
				},
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
				},
			},
			{
				in: 'query',
				name: 'search',
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
														type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                format: 'uuid'
                              },
                              name: {
                                type: 'string'
                              },
                              description: {
                                type: 'string',
                                nullable: true
                              }
                            }
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
				description: 'Get All User Groups',
			},
		},
		summary: 'Get All User Groups',
		tags: [tags.Users],
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
						required: ['groups'],
						properties: {
							groups: {
								type: 'array',
								items: {
									type: 'string',
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
												groups: {
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
		summary: "Update user's groups",
		tags: [tags.Users],
	},
};

export default path;
