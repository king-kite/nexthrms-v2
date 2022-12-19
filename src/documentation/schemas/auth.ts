import { userProfileProperties, userProfileEmployeeProperties } from "./properties"

export const AuthUserDataModel = {
	allOf: [
		{ $ref: "#/components/schemas/BaseModel" },
		{
			type: "object",
			properties: {
				data: {
					type: "object",
					required: ["email", "firstName", "lastName", "fullName"],
					properties: {
						email: {
							type: "string",
							format: "email",
							example: "johndoe@gmail.com",
							description: "The user's email",
						},
						firstName: {
							type: "string",
							example: "John",
							description: "The user's first name",
						},
						fullName: {
							type: "string",
							example: "John Doe",
							description: "The user's first name + The user's last name",
						},
						lastName: {
							type: "string",
							example: "Doe",
							description: "The user's last name",
						},
						profile: {
							type: "object",
							nullable: true,
							required: ["image"],
							description:
								"An object containing the user's profile information",
							properties: {
								image: {
									type: "string",
									description: "The user's profile image",
									example: "/images/default.png",
								},
							},
							example: {
								image: "/images/default.png",
							},
						},
						employee: {
							type: "object",
							nullable: true,
							required: ["id"],
							description: "Information if the user is an employee.",
							properties: {
								id: {
									type: "string",
									format: "uuid",
									description: "The user's employee ID",
								},
								job: {
									type: "object",
									nullable: true,
									required: ["name"],
									description: "Information about the employee job.",
									properties: {
										name: {
											type: "string",
											description: "The name of the employee job",
										},
									},
								},
							},
						},
					},
					example: {
						email: "johndoe@gmail.com",
						firstName: "John",
						fullName: "John Doe",
						lastName: "Doe",
						profile: {
							image: "/images/default.png",
						},
						employee: {
							id: "0c5535d3-9c05-4704-9269-c7229115f6e3",
							job: {
								name: "CEO",
							},
						},
					},
				},
			},
		},
	],
};

export const LoginErrorModel = {
	allOf: [
		{
			$ref: "#/components/schemas/BaseModel",
		},
		{
			type: "object",
			nullable: true,
			properties: {
				error: {
					type: "object",
					nullable: true,
					properties: {
						email: {
							type: "string",
							nullable: true,
						},
						password: {
							type: "string",
							nullable: true,
						},
					},
				},
			},
		},
	],
};

export const UserProfileDataModel = {
	allOf: [
		{ $ref: "#/components/schemas/BaseModel" },
		{
			type: "object",
			properties: {
				data: {
					type: "object",
					required: ["email", "firstName", "lastName", "isEmailVerified"],
					properties: {
						isEmailVerified: {
							type: "boolean",
							description: "The user's email verification status",
						},
						...userProfileProperties,
						employee: {
							type: "object",
							nullable: true,
							required: ["id"],
							description: "Information if the user is an employee.",
							properties: {
								id: {
									type: "string",
									format: "uuid",
									description: "The user's employee ID",
								},
								dateEmployed: {
									type: "string",
									nullable: true,
									format: "date-time",
									description: "The user's date of birth",
								},
								department: {
									type: "object",
									nullable: true,
									required: ["name"],
									description: "Information about the employee department.",
									properties: {
										name: {
											type: "string",
											description: "The name of the employee's department",
										},
										hod: {
											type: "object",
											nullable: true,
											description:
												"Information about the employee's department HOD",
											properties: userProfileEmployeeProperties,
										},
										supervisor: {
											type: "object",
											nullable: true,
											description:
												"Information about the employee's supervisor",
											properties: userProfileEmployeeProperties,
										},
									},
								},
								job: {
									type: "object",
									nullable: true,
									required: ["name"],
									description: "Information about the employee job.",
									properties: {
										name: {
											type: "string",
											description: "The name of the employee job",
										},
									},
								},
								leaves: {
									type: "array",
									items: {
										type: "object",
										properties: {
											startDate: {
												type: "string",
												format: "date-time",
												description: "The employee's leaves commences here",
											},
											endDate: {
												type: "string",
												format: "date-time",
												description: "The employee's leaves ends here",
											},
											reason: {
												type: "string",
												description: "The reason for the leave",
											},
											type: {
												type: "string",
												description: "Type of leave",
											},
											approved: {
												type: "boolean",
												description: "leave approved?",
											},
										},
									},
								},
							},
						},
					},
					example: {
						firstName: "Jan",
						lastName: "Doe",
						email: "jandoe@gmail.com",
						isEmailVerified: true,
						profile: {
							dob: "2001-03-14T00:00:00.000Z",
							gender: "MALE",
							image:
								"/media/users/profile/jan_doe_jandoe@gmail.com_1669361137919.jpg",
							address: "This is my Home Address. Please leave a note or letter",
							city: "New City",
							phone: "08123456789",
							state: "New Town",
						},
						employee: {
							dateEmployed: "2022-10-29T08:31:54.808Z",
							department: null,
							job: {
								name: "CEO",
							},
							supervisor: null,
							leaves: [],
						},
					},
				},
			},
		},
	],
};
