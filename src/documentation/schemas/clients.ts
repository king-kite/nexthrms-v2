import { userProfileProperties } from './properties';

export const ClientModel = {
	type: 'object',
	required: ['company', 'position', 'contact'],
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
		contact: {
			type: 'string',
			required: ['email', 'firstName', 'lastName', 'profile'],
			properties: {
				...userProfileProperties,
				isActive: {
					type: 'boolean',
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
		company: 'Amazing Tech',
		position: 'General Consultant',
		contact: {
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
	},
};
