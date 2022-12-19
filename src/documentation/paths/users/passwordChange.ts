import responses from "../../responses";
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
						required: ["email", 'password1', 'password2'],
						properties: {
							email: {
								type: 'string',
								format: 'email'
							},
							password1: {
								type: 'string',
								format: 'password'
							},
							password2: {
								type: 'string',
								format: 'password'
							},
						},
						example: {
							email: 'jandoe@gmail.com',
							password1: 'Password?1234',
							password2: 'Password?1234'
						}
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
							$ref: refs.BASE
						},
					},
				},
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: refs.BASE },
								{
									type: "object",
									properties: {
										error: {
											type: "object",
											nullable: true,
											properties: {
												email: {
													type: "string",
													nullable: true,
												},
												password1: {
													type: "string",
													nullable: true,
												},
												password2: {
													type: "string",
													nullable: true,
												}
											},
										},
									},
								},
							],
						},
					},
				},
			},
		},
		summary: "Change User Password",
		tags: [tags.Users],
	},
};

export default path;
