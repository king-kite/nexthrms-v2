import responses from '../../responses';
import * as refs from "../../refs";
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
							$ref: refs.BASE,
						},
					}	
				},
				description: "Register user",
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{
									$ref: refs.BASE
								},
								{
									type: "object",
									nullable: true,
									properties: {
										error: {
											$ref: refs.LOGIN_ERROR											
										},
									},
								}
							]
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