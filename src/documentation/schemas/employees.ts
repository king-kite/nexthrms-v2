import {
	userProperties,
	userProfileProperties,
	userEmployeeLeavesProperties,
} from './properties';

const commonUserProperties = {
	type: 'object',
	properties: {
		...userProperties,
		profile: {
			type: 'object',
			nullable: true,
			required: ['image'],
			properties: {
				image: {
					type: 'string',
				},
			},
		},
	},
};

export const EmployeeModel = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			format: 'uuid',
		},
		dateEmployed: {
			type: 'string',
			format: 'date-time',
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
		updatedAt: {
			type: 'string',
			format: 'date-time',
		},
		user: {
			type: 'object',
			properties: {
				...userProfileProperties,
				isActive: {
					type: 'boolean',
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
				name: {
					type: 'string',
				},
			},
		},
		department: {
			type: 'object',
			nullable: true,
			properties: {
				id: {
					type: 'string',
					format: 'uuid',
				},
				name: {
					type: 'string',
				},
				hod: {
					type: 'object',
					nullable: true,
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
						},
						user: userProfileProperties,
					},
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
					department: {
						type: 'object',
						nullable: true,
						properties: {
							name: {
								type: 'string',
							},
						},
					},
					user: commonUserProperties,
				},
			},
		},
		leaves: userEmployeeLeavesProperties,
	},
	example: {
		id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
		dateEmployed: '2022-11-28T14:53:40.800Z',
		createdAt: '2022-11-28T14:53:40.800Z',
		updatedAt: '2022-11-28T14:53:40.800Z',
		leaves: [
			{
				startDate: '2022-10-29T00:00:00.000Z',
				endDate: '2022-10-29T00:00:00.000Z',
				reason: 'This is the reason for this leave.',
				type: 'ANNUAL',
				approved: true,
			},
		],
		user: {
			email: 'johnsondavis@kitehrms.com',
			firstName: 'Johnson',
			lastName: 'Davis',
			isActive: true,
			profile: {
				image:
					'/media/users/profile/johnson_davis_johnsondavis@kitehrms.com_1669584469551.jpg',
				dob: '2001-03-10T00:00:00.000Z',
				gender: 'MALE',
				address:
					"This is Johnson Davis' Home address. Leave a message here for future enquiries.",
				city: 'New Earth City',
				phone: '12345678902',
				state: 'New Earth',
			},
		},
		job: {
			id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
			name: 'CEO',
		},
		department: {
			id: 'e0c55c26-e5b8-41a2-8269-13881ad7b563',
			name: 'Administration',
			hod: {
				id: '7e9915bb-655b-4adc-ba33-12d58ead9360',
				user: {
					firstName: 'Jan',
					lastName: 'Doe',
					email: 'jandoe@kitehrms.com',
					profile: {
						image:
							'/media/users/profile/jan_doe_jandoe@kitehrms.com_1671403740847.jpg',
						dob: '2000-02-12T00:00:00.000Z',
						gender: 'MALE',
						address:
							"This is Jan Doe's Home Address. Leave any message or letter at this address",
						city: 'New City',
						phone: '08123456789',
						state: 'New State',
					},
				},
			},
		},
		supervisors: [
			{
				id: '7e9915bb-655b-4adc-ba33-12d58ead9360',
				department: {
					name: 'Research & Development',
				},
				user: {
					firstName: 'Priscilla',
					lastName: 'Andrews',
					email: 'priscillaandrews@kitehrms.com',
					profile: {
						image:
							'/media/users/profile/priscilla_andrews_priscillaandrews@kitehrms.com_1669470278039.jpg',
					},
				},
			},
		],
	},
};
