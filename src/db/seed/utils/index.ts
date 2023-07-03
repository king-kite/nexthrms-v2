export type ProfileType = {
	dob?: Date;
	image?: {
		create: {
			url: string;
			size: number;
			name: string;
			type: string;
		};
	};
	nameAddress?: string;
	address?: string;
	city?: string;
	phone?: string;
	state?: string;
	gender?: 'MALE' | 'FEMALE';
};

export function getProfile({
	dob = new Date(),
	image = {
		create: {
			url: '/images/default.png',
			size: 0,
			name: 'user.png',
			type: 'image',
		},
	},
	nameAddress = 'my',
	address,
	city = 'New City',
	phone = '08123456789',
	state = 'New State',
	gender = 'MALE',
}: ProfileType) {
	return {
		dob,
		image,
		address:
			address ||
			`This is ${nameAddress} Home Address. Please leave all messages here.`,
		city,
		phone,
		state,
		gender,
	};
}

export const anonymousUserEmail = 'anonymous@kitehrms.com';
export const anonymousUserId = '12345678-1234-4b89-8c04-789012345678';
