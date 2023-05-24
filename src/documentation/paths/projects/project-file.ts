import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

const path = {
	delete: {
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
			{
				in: 'path',
				name: 'projectFileId',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			},
			"404": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			}
		},
		summary: "Delete Single Project File",
		tags: [tags.Projects]
	}
};

export default path;
