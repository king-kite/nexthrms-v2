import { exportDataParametersWithSearch as parameters } from "../../parameters"
import responses from "../../responses";
import * as tags from "../../tags";

const path = {
	get: {
		parameters,
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
				description: "Export Jobs Information",
			},
		},
		summary: "Export Jobs Data",
		tags: [tags.Jobs],
	},
};

export default path;
