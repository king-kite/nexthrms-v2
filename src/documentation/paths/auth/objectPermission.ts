import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';
import { models } from './../../../config';

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'modelName',
				required: true,
				schema: {
					type: 'string',
					format: JSON.stringify(models)
						.replace('[', '(')
						.replace(']', ')')
						.replaceAll(',', ' | '),
				},
			},
			{
				in: 'path',
				name: 'objectId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid',
				},
			},
			{
				in: 'query',
				name: 'permission',
				required: false,
				schema: {
					type: 'string',
					format: 'DELETE | EDIT | VIEW',
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
												delete: {
													type: 'boolean',
												},
												edit: {
													type: 'boolean',
												},
												view: {
													type: 'boolean',
												},
											},
										},
									},
								},
							],
						},
					},
				},
				description:
					"This returns an object containing the user's permission for the specified record!",
			},
			'404': {
				content: {
					'application/json': {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: 'object',
									properties: {
										data: {
											$ref: refs.USER_PROFILE_DATA,
										},
									},
								},
							],
						},
					},
				},
				description: 'User Profile Information',
			},
			'403': undefined,
		},
		summary: "Get Object's Permissions",
		tags: [tags.Authentication],
	},
};

export default path;
