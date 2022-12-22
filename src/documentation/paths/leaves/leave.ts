import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

import { requestExample, requestProperties } from './leaves';

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
											$ref: refs.LEAVE,
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: 'Get Single Leave',
		tags: [tags.Leaves],
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
						properties: requestProperties,
						example: requestExample,
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
		summary: 'Update Single Leave',
		tags: [tags.Leaves],
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
		summary: 'Delete Single Leave',
		tags: [tags.Leaves],
	},
};

export default path;