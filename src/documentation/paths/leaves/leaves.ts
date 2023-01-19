import { parametersWithSearch as parameters } from '../../parameters';
import responses from '../../responses';

import * as refs from '../../refs';
import * as tags from '../../tags';

import { LeaveModel } from '../../schemas/leaves';

export const requestProperties = {
	type: {
		required: true,
		...LeaveModel.properties.type,
	},
	startDate: {
		required: true,
		...LeaveModel.properties.startDate,
	},
	endDate: {
		required: true,
		...LeaveModel.properties.endDate,
	},
	reason: {
		required: true,
		...LeaveModel.properties.reason,
	},
};

export const requestExample = {
	type: 'CASUAL',
	startDate: '2001-03-10T00:00:00.000Z',
	endDate: '2001-03-15T00:00:00.000Z',
	reason: 'This is the reason for this leave.',
};

const path = {
	get: {
		parameters,
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
											$ref: refs.LEAVE,
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
												startDate: {
													type: 'string',
													nullable: true,
												},
												endDate: {
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
		summary: 'Request a leave',
		tags: [tags.Leaves],
	},
};

export default path;
