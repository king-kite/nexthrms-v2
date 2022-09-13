import { Prisma } from '@prisma/client';

import prisma from '../client';
import { ProfileType } from '../../types';

const userSelect: Prisma.UserSelect = {
	firstName: true,
	lastName: true,
	email: true,
	profile: {
		select: {
			image: true,
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
		},
	},
};

export const getProfile = async (id: string): Promise<ProfileType | null> => {
	const user = await prisma.user.findUnique({
		where: { id },
		select: {
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
					id: true,
					dateEmployed: true,
					department: {
						select: {
							name: true,
							hod: {
								select: {
									user: {
										select: {
											firstName: true,
											lastName: true,
											email: true,
											profile: {
												select: {
													image: true,
												},
											},
										},
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
								select: {
									firstName: true,
									lastName: true,
									email: true,
									profile: {
										select: {
											image: true,
										},
									},
								},
							},
						},
					},
				},
			},
		},
	});

	return user;
};
