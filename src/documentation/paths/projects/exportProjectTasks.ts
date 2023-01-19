import { exportDataParametersWithSearch as parameters } from '../../parameters';
import responses from "../../responses";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'projectId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			},
			...parameters
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
				description: "Export Project Tasks Information",
			},
		},
		summary: "Export Project Tasks Data",
		tags: [tags.Projects],
	},
};

export default path;
