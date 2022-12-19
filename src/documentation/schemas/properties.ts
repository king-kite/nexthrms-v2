export const profileProperties = {
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
			},
			dob: {
				type: "string",
				nullable: true,
				format: "date-time",
				description: "The user's date of birth",
			},
			gender: {
				type: "string",
				nullable: true,
				format: "MALE | FEMALE",
				description: "The user's date of birth",
			},
			address: {
				type: "string",
				nullable: true,
				description: "The user's contact address",
			},
			phone: {
				type: "string",
				nullable: true,
				description: "The user's contact phone number",
			},
			state: {
				type: "string",
				nullable: true,
				description: "The user's contact state",
			},
			city: {
				type: "string",
				nullable: true,
				description: "The user's contact city",
			},
		},
	},
}

export const userProperties = {
	email: {
		type: "string",
		format: "email",
	},
	firstName: {
		type: "string",
	},
	lastName: {
		type: "string",
	},
}

export const userProfileProperties = {
	...userProperties,
	...profileProperties
}

export const userProfileEmployeeProperties = {
	user: {
		type: "object",
		properties: {
			...userProperties,
			profile: {
				type: "object",
				nullable: true,
				required: ["image"],
				properties: {
					image: {
						type: "string",
					},
				},
			},
			employee: {
				type: "object",
				nullable: true,
				properties: {
					department: {
						type: "object",
						nullable: true,
						required: ["id", "name"],
						properties: {
							id: {
								type: "string",
								format: "uuid",
							},
							name: {
								type: "string",
							},
						},
					},
				},
			},
		},
	},
};