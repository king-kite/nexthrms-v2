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
				description: 'Export Groups Information',
			},
		},
		summary: 'Export Groups Data',
		tags: [tags.Groups],
	},
};

export default path;
