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
				description: "Export Departments Information",
			},
		},
		summary: "Export Departments Data",
		tags: [tags.Departments],
	},
};

export default path;
