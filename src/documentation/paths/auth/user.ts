import responses from '../../responses';
import * as refs from "../../refs";
import * as tags from "../../tags";

const path = {
	get: {
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.AUTH_USER_DATA,
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