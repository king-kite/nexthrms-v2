import responses from '../../responses';
import * as refs from "../../refs";
import * as tags from "../../tags"

const path = {
	post: {
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE,
						},
					}	
				},
				description: "Log out the user",
			},
		},
		summary: "Sign Out User",
		tags: [tags.Authentication],
	},
}

export default path;