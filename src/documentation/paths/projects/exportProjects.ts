import { exportDataParametersWithSearch as parameters } from '../../parameters';
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
				description: "Export Projects Information",
			},
		},
		summary: "Export Projects Data",
		tags: [tags.Projects],
	},
};

export default path;
