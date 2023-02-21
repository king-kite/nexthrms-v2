import responses from '../../responses';
import * as refs from '../../refs';
import * as tags from '../../tags';

import { models } from '../../../config';

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
					format: "'CREATE' | 'DELETE' | 'EDIT' | 'VIEW'",
				},
			},
			{
				in: 'query',
				name: 'groupLimit',
				schema: {
					type: 'number',
					default: 10,
				},
			},
			{
				in: 'query',
				name: 'groupOffset',
				schema: {
					type: 'number',
					default: 0,
				},
			},
			{
				in: 'query',
				name: 'groupSearch',
				required: false,
				schema: {
					type: 'string',
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
											$ref: refs.PERMISSION_OBJECT,
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
		summary: 'Get Object/Record Permissions',
		tags: [tags.Permissions],
	},
};

export default path;
