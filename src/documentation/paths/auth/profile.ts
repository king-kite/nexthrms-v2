import responses from '../../responses';

const user = {
	get: {
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/UserProfileDataModel",
						},
					}	
				},
				description: "User Profile Information",
			},
		},
		summary: "Get User Profile Data",
		tags: ["Authentication"],
	},
}

export default user;