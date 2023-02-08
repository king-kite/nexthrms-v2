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
				description: 'Get All User Permissions',
			},
		},
		summary: 'Get All User Permissions',
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
						required: ['permissions'],
						properties: {
							permissions: {
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
												permissions: {
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
		summary: "Update user's permissions",
		tags: [tags.Users],
	},
};

export default path;
