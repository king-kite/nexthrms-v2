import responses from "../../responses";

const login ={
	post: {
		// description: 'Sign In User',
		requestBody: {
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							email: {
								type: "string",
								format: "email",
							},
							password: {
								writeOnly: true,
								type: "string",
								format: "password",
							},
						},
						example: {
							email: "jandoe@gmail.com",
							password: "Password?1234",
						},
					},
				},
			},
		},
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
			"400": {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/LoginErrorModel"
						}
					}
				},
				description: "Bad Request"
			},
		},
		summary: "Sign In User",
		tags: ["Authentication"],
	},
}

export default login;