import { userProfileProperties } from './properties';

export const UserModel = {
	type: 'object',
	properties: {
		...userProfileProperties,
		isActive: {
			type: 'boolean',
		},
		isEmailVerified: {
			type: 'boolean',
		},
		isAdmin: {
			type: 'boolean',
		},
		isSuperUser: {
			type: 'boolean',
		},
		client: {
			type: 'object',
			nullable: true,
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
				},
				company: {
					type: 'string',
				},
				position: {
					type: 'string',
				},
			},
		},
		employee: {
			type: 'object',
			nullable: true,
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
				},
				department: {
					type: 'object',
					nullable: true,
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
						},
					},
				},
				supervisors: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: {
								type: 'string',
								format: 'uuid',
							},
						},
					},
				},
				job: {
					type: 'object',
					nullable: true,
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
						},
					},
				},
				leaves: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							startDate: {
								type: 'string',
								format: 'date-time',
								description: "The employee's leaves commences here",
							},
							endDate: {
								type: 'string',
								format: 'date-time',
								description: "The employee's leaves ends here",
							},
							reason: {
								type: 'string',
								description: 'The reason for the leave',
							},
							type: {
								type: 'string',
								description: 'Type of leave',
							},
							approved: {
								type: 'boolean',
								description: 'leave approved?',
							},
						},
					},
				},
			},
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		email: 'johnsondavis@kitehrms.com',
		firstName: 'Johnson',
		lastName: 'Davis',
		isActive: true,
		isAdmin: false,
		isEmailVerified: true,
		isSuperUser: false,
		createdAt: '2022-10-29T00:00:00.000Z',
		updatedAt: '2022-11-28T14:53:40.800Z',
		client: {
			id: 'c5d595ca-d1c6-4e8b-9726-34053fbec844',
			company: 'Microsoft Headings',
			position: 'CEO',
		},
		employee: {
			id: '3945e858-b12a-4f4b-affe-a4451bf6d7b1',
			department: {
				id: 'fe4f7293-d239-4657-9c9c-5eb8ff83d6d1',
			},
			job: {
				id: '2ca4dfe0-08af-43f6-8687-d278647286ca',
			},
			supervisors: [
				{
					id: '34751d45-e2a5-4d3f-ace7-1b739712010b',
					employee: {
						id: '34751d45-e2a5-4d3f-ace7-1b739712010b',
					},
				},
			],
			leaves: [
				{
					startDate: '2022-10-29T00:00:00.000Z',
					endDate: '2022-10-29T00:00:00.000Z',
					reason: 'This is the reason for this leave.',
					type: 'ANNUAL',
					approved: true,
				},
			],
		},
		profile: {
			image: {
				id: '12345678-3456-7890-12345678',
				url: '/media/users/profile/johnson_davis_johnsondavis@kitehrms.com_1669584469551.jpg',
			},
			dob: '2001-03-10T00:00:00.000Z',
			gender: 'MALE',
			address:
				"This is Johnson Davis' Home address. Leave a message here for future enquiries.",
			city: 'New Earth City',
			phone: '12345678902',
			state: 'New Earth',
		},
	},
};
