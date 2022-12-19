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
							uid: "58aa746a-5973-4e80-a635-db4eff513a2a",
							token: "9153d2144ec53102b8d64c51209a745b6f5c67f555d0085c8c2ee90a9645fce26f506ce1641948cab7afd16ea7c04c0c"
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
				description: "Email Verification Link Confirmed",
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
		summary: "Confirm User Email Verification Link",
		tags: [tags.Authentication],
	},
}

export default path;