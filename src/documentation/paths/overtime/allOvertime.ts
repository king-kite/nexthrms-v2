import responses from '../../responses';

import * as refs from '../../refs';
import * as tags from '../../tags';

import { OvertimeModel } from '../../schemas/overtime';

export const requestProperties = {
	type: {
		required: true,
		...OvertimeModel.properties.type,
	},
	date: {
		required: true,
		...OvertimeModel.properties.date,
	},
	hours: {
		required: true,
		...OvertimeModel.properties.hours,
	},
	reason: {
		required: true,
		...OvertimeModel.properties.reason,
	},
};

export const requestExample = {
	type: 'VOLUNTARY',
	date: '2001-03-10T00:00:00.000Z',
	hours: 2,
	reason: 'This is the reason for this overtime.',
};

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
													type: 'number',
												},
												denied: {
													type: 'number',
												},
												pending: {
													type: 'number',
												},
												total: {
													type: 'number',
												},
												result: {
													type: 'array',
													items: {
														$ref: refs.OVERTIME,
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
		summary: 'Get All Overtime',
		tags: [tags.Overtime],
	},
	post: {
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: requestProperties,
						example: requestExample,
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
											$ref: refs.OVERTIME,
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
												type: {
													type: 'string',
													nullable: true,
												},
												date: {
													type: 'string',
													nullable: true,
												},
												hours: {
													type: 'string',
													nullable: true,
												},
												reason: {
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
		summary: 'Request an overtime',
		tags: [tags.Overtime],
	},
};

export default path;
