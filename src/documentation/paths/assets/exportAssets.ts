import {exportDataParameters as parameters} from "../../parameters";
import responses from "../../responses";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
			...parameters,
			{
				in: 'query',
				name: 'type',
				schema: {
					type: "'csv' | 'excel'",
					default: 'csv',
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
				description: 'Export Assets Information',
			},
		},
		summary: 'Export Assets Data',
		tags: [tags.Assets],
	},
};

export default path;
