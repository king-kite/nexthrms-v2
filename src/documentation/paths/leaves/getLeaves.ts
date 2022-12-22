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
				name: 'from',
				required: false,
				schema: {
					type: 'string',
					format: 'date-time',
				},
			},
			{
				in: 'query',
				name: 'to',
				required: false,
				schema: {
					type: 'string',
					format: 'date-time',
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
												approved: {
													type: 'number'
												},
												denied: {
													type: 'number'
												},
												pending: {
													type: 'number'
												},
												total: {
													type: 'number'
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.LEAVE,
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
		summary: 'Get Leaves',
		tags: [tags.Leaves],
	},
};

export default path