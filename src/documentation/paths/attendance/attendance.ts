import responses from "../../responses";

import * as refs from '../../refs';
import * as tags from '../../tags';

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0,
				},
			},
			{
				in: 'query',
				name: 'from',
				required: false,
				schema: {
					type: 'date-time',
				},
			},
			{
				in: 'query',
				name: 'to',
				required: false,
				schema: {
					type: 'date-time',
					default: new Date().toLocaleDateString('en-Ca')
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
														$ref: refs.ATTENDANCE,
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
		summary: 'Get All Attendance',
		tags: [tags.Attendance],
	},
	post: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							action: {
								type: 'string',
								format: "'IN' | 'OUT'",
							},
						},
						example: {
							action: 'IN',
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
											$ref: refs.ATTENDANCE,
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
											properties: {
												action: {
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
		summary: 'Clock in or out for the day',
		tags: [tags.Attendance],
	},
};

export default path;