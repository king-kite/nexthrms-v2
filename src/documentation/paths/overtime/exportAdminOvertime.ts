import responses from "../../responses";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
			{
				in: 'query',
				name: 'type',
				schema: {
					type: "'csv' | 'excel'",
					default: "csv"
				}
			},
			{
				in: 'query',
				name: 'limit',
				schema: {
					type: 'number',
					default: 10,
				}
			},
			{
				in: 'query',
				name: 'offset',
				schema: {
					type: 'number',
					default: 0,
				}
			},
			{
				in: 'query',
				name: 'search',
				required: false,
				schema: {
					type: 'string',
				}
			},
			{
				in: 'query',
				name: 'from',
				required: false,
				schema: {
					type: 'string',
					format: 'date-time'
				}
			},
			{
				in: 'query',
				name: 'to',
				required: false,
				schema: {
					type: 'string',
					format: 'date-time'
				}
			},
		],
		responses: {
			...responses,
			"200": {
				content: {
					"application/csv": {
						schema: {
							type: 'string',
							format: 'binary'
						},
					},
					"application/excel": {
						schema: {
							type: 'string',
							format: 'binary'
						},
					},
				},
				description: "Export Overtime Information",
			},
		},
		summary: "Export Overtime Data",
		tags: [tags.Overtime],
	},
};

export default path;
