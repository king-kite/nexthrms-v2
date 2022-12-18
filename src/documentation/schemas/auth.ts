export const AuthUserDataModel = {
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
			description: "An object containing the user's profile information",
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
							descrpition: "The name of the employee job",
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
};

export const LoginErrorModel = {
	allOf: [
		{
			$ref: "#/components/schemas/BaseErrorModel",
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
