import responses from "../../responses";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
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
				name: 'from',
				schema: {
					type: 'string',
					format: 'date-time'
				}
			},
			{
				in: 'query',
				name: 'to',
				schema: {
					type: 'string',
					format: 'date-time'
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
				description: "Export Assets Information",
			},
		},
		summary: "Export Assets Data",
		tags: [tags.Assets],
	},
};

export default path;
