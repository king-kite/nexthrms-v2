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
							oldPassword: {
								type: 'string',
								format: 'password'
							},
							newPassword1: {
								type: 'string',
								format: 'password'
							},
							newPassword2: {
								type: 'string',
								format: 'password'
							},
						},
						example: {
							oldPassword: 'Password?12345',
							newPassword1: 'Password?1234',
							newPassword2: 'Password?1234'
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
				description: "Password Changed",
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
												oldPassword: {
													type: 'string',
													nullable: true
												},
												newPassword1: {
													type: 'string',
													nullable: true
												},
												newPassword2: {
													type: 'string',
													nullable: true
												},
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
			}
		},
		summary: "Change Password",
		tags: [tags.Authentication],
	},
}

export default path;