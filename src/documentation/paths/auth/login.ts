import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

const path ={
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
							allOf: [
								{ $ref: refs.BASE },
								{ 
									type: 'object',
									properties: {
										data: {
											$ref: refs.AUTH_USER_DATA 
										}
									}
								},
							]
						},
					}
				},
				description: "User Authentication Data",
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
			"401": undefined,
			"403": undefined
		},
		summary: "Sign In User",
		tags: [tags.Authentication],
	},
}

export default path;