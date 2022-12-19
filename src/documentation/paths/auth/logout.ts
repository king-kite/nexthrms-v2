import responses from '../../responses';
import * as tags from "../../tags"

const path = {
	post: {
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/BaseModel",
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