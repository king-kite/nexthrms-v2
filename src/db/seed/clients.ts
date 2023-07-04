import { Prisma, PrismaClient } from '@prisma/client';

import { anonymousUserEmail, getProfile, ProfileType } from './utils';
import logger from './utils/logger';
import { hashPassword as hash } from '../../utils/bcrypt';

async function getClient({
	firstName,
	lastName,
	email,
	password = 'Password?1234',
	isAdmin = false,
	isSuperUser = false,
	isEmailVerified = true,
	profile,
	profileInfo,
	company,
	position,
}: {
	firstName: string;
	lastName: string;
	email: string;
	password?: string;
	isAdmin?: boolean;
	isSuperUser?: boolean;
	isEmailVerified?: boolean;
	profile?: Prisma.ProfileCreateNestedOneWithoutUserInput;
	profileInfo?: ProfileType;
	company: string;
	position: string;
}) {
	return {
		firstName,
		lastName,
		email,
		password: await hash(password),
		isAdmin,
		isSuperUser,
		isEmailVerified,
		profile: profile || {
			create: getProfile({
				...profileInfo,
			}),
		},
		client: {
			create: {
				company,
				position,
			},
		},
	};
}

async function main(prisma: PrismaClient) {
	// Delete the previous users
	logger.info('Removing Old Clients Data...');
	await prisma.user.deleteMany({
		where: {
			AND: [
				{
					client: { isNot: null },
				},
				{
					employee: { is: null },
				},
			],
			email: {
				notIn: [anonymousUserEmail],
			},
		},
	});
	logger.success('Removed Old Clients Successfully!');

	logger.info('Adding Clients...');

	// Loading Clients
	const clients = [
		await getClient({
			firstName: 'Mon',
			lastName: 'Day',
			email: 'monday@kitehrms.com',
			profileInfo: {
				dob: new Date(2001, 2, 14),
				nameAddress: "Mon Day's",
			},
			position: 'CEO',
			company: 'Pacific',
		}),
		await getClient({
			firstName: 'Tues',
			lastName: 'Day',
			email: 'tuesday@kitehrms.com',
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2002, 5, 18),
				nameAddress: "Tues Day's",
			},
			position: 'Human Resources Manager',
			company: 'Outreach Enterprises',
		}),
		await getClient({
			firstName: 'Wed',
			lastName: 'Day',
			email: 'wednesday@kitehrms.com',
			profileInfo: {
				dob: new Date(2005, 5, 18),
				nameAddress: "Wed Day's",
			},
			position: 'Health Representative',
			company: 'HealthCare Supreme',
		}),
		await getClient({
			firstName: 'Thurs',
			lastName: 'Day',
			email: 'thursday@kitehrms.com',
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2006, 1, 24),
				nameAddress: "Thurs Day's",
			},
			position: 'Health Personal',
			company: 'Zoom Technologies',
		}),
		await getClient({
			firstName: 'Fri',
			lastName: 'Day',
			email: 'friday@kitehrms.com',
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2003, 11, 1),
				nameAddress: "Fri Doe's",
			},
			position: 'Human Resources Personal',
			company: 'Pulpy Care',
		}),
		await getClient({
			firstName: 'Satur',
			lastName: 'Day',
			email: 'saturday@kitehrms.com',
			profileInfo: {
				gender: 'FEMALE',
				dob: new Date(2003, 5, 17),
				nameAddress: "Satur Day's",
			},
			position: 'Aero Engineer',
			company: 'Global Space',
		}),
		await getClient({
			firstName: 'Sun',
			lastName: 'Day',
			email: 'sunday@kitehrms.com',
			profileInfo: {
				dob: new Date(1999, 5, 17),
				nameAddress: "Sun Day's",
			},
			position: 'Space Observer',
			company: 'Global Space',
		}),
	];

	const allClients = clients.map((client) =>
		prisma.user.create({
			data: client,
			select: { id: true },
		})
	);

	await Promise.all([...allClients]);

	logger.success('Added Clients Successfully!');
}

export default main;