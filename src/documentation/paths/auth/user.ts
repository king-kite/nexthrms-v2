import responses from '../../responses';
import * as tags from "../../tags";

const path = {
	get: {
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/AuthUserDataModel",
						},
					}	
				},
				description: "User Authentication Data",
			},
		},
		summary: "Get User Data",
		tags: [tags.Authentication],
	},
}

export default path;