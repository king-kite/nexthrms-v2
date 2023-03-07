const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { getProfile } = require('./common.js');
const {
	anonymousUserId,
	logger,
	bcrypt: { hash },
} = require('./utils/index.js');

async function getUser({
	firstName,
	lastName,
	email,
	password = 'Password?1234',
	isAdmin = false,
	isSuperUser = false,
	isEmailVerified = true,
	profile,
	profileInfo,
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
	};
}

(async function main() {
	// Delete the previous users that neither employees and clients
	// or are both at the same time
	logger.info('Removing Old Users Data...');
	await prisma.user.deleteMany({
		where: {
			OR: [
				{
					AND: [
						{
							client: { is: null },
							employee: { is: null },
						},
					],
				},
				{
					AND: [
						{
							client: { isNot: null },
							employee: { isNot: null },
						},
					],
				},
			],
		},
	});
	logger.success('Removed Old Users Successfully!');

	logger.info('Adding Users...');

	// Loading Users
	const users = [
		// Create Anonymous User who is a client and employee. Just in case
		{
			...(await getUser({
				firstName: 'Anonymous',
				lastName: 'KiteHRMS',
				email: 'anonymous@kitehrms.com',
				password: 'Password?1234AnonymousUser',
				isActive: false,
				isSuperUser: false,
				isAdmin: false,
				isEmailVerified: false,
				profileInfo: {
					dob: new Date(),
					address:
						'This user does not have an address. Do not forward any information to him.',
				},
			})),
			id: anonymousUserId,
			employee: {
				create: {
					id: anonymousUserId,
				},
			},
			client: {
				create: {
					id: anonymousUserId,
					company: 'KiteHRMS',
					position: 'Anonymous',
				},
			},
		},

		// Neither client nor employee
		await getUser({
			firstName: 'Ember',
			lastName: 'Month',
			email: 'embermonth@kitehrms.com',
			profileInfo: {
				dob: new Date(2001, 2, 14),
				nameAddress: "Ember Month's",
			},
		}),
		// Both client and employee
		{
			...(await getUser({
				firstName: 'Full',
				lastName: 'Year',
				email: 'fullyear@kitehrms.com',
				profileInfo: {
					dob: new Date(2001, 2, 14),
					nameAddress: "Full Year's",
				},
			})),
			client: {
				create: {
					position: 'Hiring Manager',
					company: 'Hotel Vatista',
				},
			},
			employee: {
				create: {
					dateEmployed: new Date(),
					job: {
						connectOrCreate: {
							where: {
								name: 'Hiring Manager',
							},
							create: {
								name: 'Hiring Manager',
							},
						},
					},
					department: {
						connectOrCreate: {
							where: {
								name: 'Human Resources',
							},
							create: {
								name: 'Human Resources',
							},
						},
					},
				},
			},
		},
	];

	const allUsers = users.map((user) =>
		prisma.user.create({
			data: user,
			select: { id: true },
		})
	);

	await Promise.all([...allUsers]);

	logger.success('Added Users Successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
