import responses from '../../responses';
import * as tags from "../../tags";

const path = {
	post: {
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
			"201": {
				content: {
					"application/json": {
						schema: {
							$ref: "#/components/schemas/BaseModel",
						},
					}	
				},
				description: "Register user",
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
			"401": undefined
		},
		summary: "Sign Up User",
		tags: [tags.Authentication],
	},
}

export default path;