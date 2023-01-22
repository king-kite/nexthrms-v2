import { Prisma } from '@prisma/client';

import prisma from '../client';
import { ProfileType } from '../../types';

const date = new Date();
date.setHours(0, 0, 0, 0);

const userSelect: Prisma.UserSelect = {
	firstName: true,
	lastName: true,
	email: true,
	profile: {
		select: {
			image: true,
		},
	},
	employee: {
		select: {
			department: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
};

export const profileUserSelectQuery: Prisma.UserSelect = {
	firstName: true,
	lastName: true,
	email: true,
	isEmailVerified: true,
	profile: {
		select: {
			dob: true,
			gender: true,
			image: true,
			address: true,
			city: true,
			phone: true,
			state: true,
		},
	},
	employee: {
		select: {
			dateEmployed: true,
			department: {
				select: {
					name: true,
					hod: {
						select: {
							user: {
								select: userSelect,
							},
						},
					},
				},
			},
			job: {
				select: {
					name: true,
				},
			},
			supervisor: {
				select: {
					user: {
						select: userSelect,
					},
				},
			},
			leaves: {
				where: {
					status: {
						equals: 'APPROVED',
					},
					startDate: {
						lte: date,
					},
					endDate: {
						gte: date,
					},
				},
				select: {
					status: true,
					reason: true,
					startDate: true,
					endDate: true,
					type: true,
				},
			},
		},
	},
};

export const getProfile = async (id: string): Promise<ProfileType | null> => {
	// Should be of type PRofileType but typescript won't keep quiet;
	const user: any = await prisma.user.findUnique({
		where: { id },
		select: profileUserSelectQuery,
	});

	return user;
};

const permissionSelect = {
	id: true,
	name: true,
	category: {
		select: {
			id: true,
			name: true,
		},
	},
	codename: true,
	description: true,
};

export const authSelectQuery = {
	id: true,
	email: true,
	firstName: true,
	lastName: true,
	isActive: true,
	isEmailVerified: true,
	password: true,
	profile: {
		select: {
			image: true,
		},
	},
	employee: {
		select: {
			id: true,
			job: {
				select: {
					name: true,
				},
			},
		},
	},
	groups: {
		select: {
			id: true,
			name: true,
			permissions: {
				select: permissionSelect,
			},
		},
	},
	permissions: {
		select: permissionSelect,
	},
};
