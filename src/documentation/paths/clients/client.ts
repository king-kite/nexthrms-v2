import responses from "../../responses";
import * as refs from "../../refs";
import * as tags from "../../tags";

const path = {
	get: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
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
											$ref: refs.EMPLOYEE,
										}
									}
								}
							],
						},
					},
				},
				description: "Get Single Employee Information",
			},
			"404": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			}
		},
		summary: "Get Single Employee",
		tags: [tags.Employees],
	},
	put: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
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
								required: [
									"department",
									"job"
								],
								properties: {
									dateEmployed: {
										type: 'string',
										format: 'date-time'
									},
									department: {
										type: 'string',
										format: 'uuid'
									},
									job: {
										type: 'string',
										format: 'uuid'
									},
									supervisor: {
										type: 'string',
										nullable: true,
										format: 'uuid'
									},
									userId: {
										type: 'string',
										nullable: true,
										format: 'uuid'
									},
									user: {
										type: 'object',
										nullable: true,
										required: ["firstName", "lastName", "email", "profile"],
										properties: {
											firstName: {
												type: "string",
											},
											lastName: {
												type: "string",
											},
											email: {
												type: "string",
												format: 'email'
											},
											profile: {
												type: "object",
												required: ["image"],
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
										}
									}
								},
								example: {
									dateEmployed: "2022-10-29T00:00:00.000Z",
									department: "9c48f93c-35d8-47b3-ad2a-938689b63262",
									supervisor: "9c48f93c-35d8-47b3-ad2a-938689b63262",
									job: "9c48f93c-35d8-47b3-ad2a-938689b63262",
									user: {
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
										}
									},
									userId: null
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
							allOf: [
								{ $ref: refs.BASE },
								{
									type: "object",
									properties: {
										data: {
											$ref: refs.EMPLOYEE,
										},
									},
								},
							],
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
												firstName: {
													type: "string",
													nullable: true,
												},
												lastName: {
													type: "string",
													nullable: true,
												},
												email: {
													type: "string",
													nullable: true,
												},
												phone: {
													type: "string",
													nullable: true,
												},
												image: {
													type: "string",
													nullable: true,
												},
												gender: {
													type: "string",
													nullable: true,
												},
												address: {
													type: "string",
													nullable: true,
												},
												state: {
													type: "string",
													nullable: true,
												},
												city: {
													type: "string",
													nullable: true,
												},
												dob: {
													type: "string",
													nullable: true,
												},
												isActive: {
													type: "string",
													nullable: true,
												},
												isAdmin: {
													type: "string",
													nullable: true,
												},
												isEmailVerified: {
													type: "string",
													nullable: true,
												},
												isSuperUser: {
													type: "string",
													nullable: true,
												},
												createdAt: {
													type: "string",
													nullable: true,
												},
												dateEmployed: {
													type: "string",
													nullable: true,
												},
												department: {
													type: "string",
													nullable: true,
												},
												job: {
													type: "string",
													nullable: true,
												},
												supervisor: {
													type: "string",
													nullable: true,
												},
												company: {
													type: "string",
													nullable: true,
												},
												position: {
													type: "string",
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
		summary: "Updated Single Employee",
		tags: [tags.Employees],
	},
	delete: {
		parameters: [
			{
				in: 'path',
				name: 'id',
				required: true,
				schema: {
					type: 'string',
					format: 'uuid'
				}
			}
		],
		responses: {
			...responses,
			"200": {
				content: {
					"application/json": {
						schema: {
							$ref: refs.BASE
						}
					}
				}
			}
		},
		summary: "Delete Single Employee",
		tags: [tags.Employees]
	}
};

export default path;
