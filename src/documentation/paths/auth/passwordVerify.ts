import responses from "../../responses";
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
							uid: {
								type: "string",
								format: "uuid",
							},
							token: {
								type: "string"
							}
						},
						example: {
							uid: "07967e1f-f9e1-46b8-9303-662535dd4710",
							token: "52fe61909430926fc2b3a41c85538f3dc3eaaf9b526a65951d46b9a19d113f590ecd3779d4cf0b29771c4c88ce07fe55"
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
							$ref: "#/components/schemas/BaseModel",
						},
					}
				},
				description: "Password Reset Link Verified",
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{$ref: "#/components/schemas/BaseModel"},
								{
									type: "object",
									properties: {
										error: {
											type: "object",
											nullable: true,
											properties: {
												token: {
													type: 'string',
													nullable: true
												}
											}
										}
									},
									nullable: true
								}
							]
						}
					}
				},
				description: "Bad Request"
			},
			"307": undefined,
			"401": undefined
		},
		summary: "Verify Password Reset Link",
		tags: [tags.Authentication],
	},
}

export default path;