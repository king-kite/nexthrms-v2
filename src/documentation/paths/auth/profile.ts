import responses from "../../responses";

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
					},
				},
				description: "User Profile Information",
			},
		},
		summary: "Get User Profile Data",
		tags: ["Authentication"],
	},
	put: {
		requestBody: {
			required: true,
			content: {
				"multipart/form-data": {
					schema: {
						type: "object",
						properties: {
							image: {
								type: "string",
								format: "base64",
							},
							form: {
								type: "object",
								required: ['firstName', 'lastName', 'email', 'profile'],
								properties: {
									firstName: {
										type: "string",
									},
									lastName: {
										type: "string",
										format: "email",
									},
									email: {
										type: "string",
									},
									profile: {
										type: "object",
										required: ['image'],
										properties: {
											phone: {
												type: "string",
											},
											gender: {
												type: "string",
												format: "MALE | FEMALE",
											},
											image: {
												type: "string",
											},
											dob: {
												type: "string",
												format: "date-time",
											},
											address: {
												type: "string",
											},
											state: {
												type: "string",
											},
											city: {
												type: "string",
											},
										},
									},
								},
								example: {
									firstName: "Jan",
									lastName: "Doe",
									email: "jandoe@gmail.com",
									profile: {
										phone: "08123456789",
										gender: "MALE",
										image:
											"/media/users/profile/jan_doe_jandoe@gmail.com_1671403740847.jpg",
										address:
											"This is Jan Doe's Home Address. Leave any message or letter at this address",
										state: "New State",
										city: "New City",
										dob: "2000-02-12",
									},
								},
							},
						},
					},
					encoding: {
						image: {
							contentType: "image/*",
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
							$ref: "#/components/schemas/UserProfileDataModel",
						},
					},
				},
			},
			"400": {
				content: {
					"application/json": {
						schema: {
							allOf: [
								{ $ref: "#/components/schemas/BaseModel" },
								{
									type: "object",
									properties: {
										error: {
											type: "object",
											nullable: true,
											properties: {
												firstName: {
													type: 'string',
													nullable: true,
												},
												lastName: {
													type: 'string',
													nullable: true,
												},
												email: {
													type: 'string',
													nullable: true,
												},
												phone: {
													type: 'string',
													nullable: true,
												},
												image: {
													type: 'string',
													nullable: true,
												},
												gender: {
													type: 'string',
													nullable: true,
												},
												address: {
													type: 'string',
													nullable: true,
												},
												state: {
													type: 'string',
													nullable: true,
												},
												city: {
													type: 'string',
													nullable: true,
												},
												dob: {
													type: 'string',
													nullable: true,
												},
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
		summary: "Update User Profile Data",
		tags: ["Authentication"],
	},
};

export default user;
