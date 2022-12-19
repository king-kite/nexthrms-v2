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
							}
						},
						example: {
							email: "jandoe@gmail.com",
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
							$ref: refs.BASE,
						},
					}
				},
				description: "Email Verification Link Sent",
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{$ref: refs.BASE},
								{
									type: "object",
									properties: {
										error: {
											type: "object",
											nullable: true,
											properties: {
												email: {
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
			"404": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{$ref: refs.BASE},
								{
									type: "object",
									properties: {
										error: {
											type: "object",
											nullable: true,
											properties: {
												email: {
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
		summary: "Send User Email Verification Link",
		tags: [tags.Authentication],
	},
}

export default path;