import {exportDataParametersWithSearch as parameters} from "../../parameters";
import responses from "../../responses";
import * as tags from "../../tags";

const path = {
	get: {
		parameters,
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