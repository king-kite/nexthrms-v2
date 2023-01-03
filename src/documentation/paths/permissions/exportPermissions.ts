import responses from '../../responses';
import * as tags from '../../tags';

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'type',
				schema: {
					type: "'csv' | 'excel'",
					default: 'csv',
				},
			},
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
				name: 'search',
				required: false,
				schema: {
					type: 'string',
				},
			},
			{
				in: 'query',
				name: 'all',
				required: false,
				schema: {
					type: 'number',
					default: 0,
					description:
						'Fetch all permissions from the database. Enter 0 for false and 1 for true',
				},
			},
		],
		responses: {
			...responses,
			'200': {
				content: {
					'application/csv': {
						schema: {
							type: 'string',
							format: 'binary',
						},
					},
					'application/excel': {
						schema: {
							type: 'string',
							format: 'binary',
						},
					},
				},
				description: 'Export Permissions Information',
			},
		},
		summary: 'Export Permissions Data',
		tags: [tags.Permissions],
	},
};

export default path;
