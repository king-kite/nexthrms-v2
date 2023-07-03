import { PrismaClient } from '@prisma/client';
import promptSync from 'prompt-sync';

import logger from '../utils/logger';
import { getEmail, getPassword } from '../utils/validators';
import { hashPassword as hash } from '../../../utils/bcrypt';

const prompt = promptSync({ sigint: true });

async function create(
	prisma: PrismaClient,
	data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}
) {
	if (!data.email) throw new Error('Email address is required');

	if (!data.password) throw new Error('Password is required');

	await prisma.user.create({
		data: {
			firstName: data.firstName || 'super',
			lastName: data.lastName || 'user',
			email: data.email.toLowerCase().trim(),
			password: await hash(data.password),
			isAdmin: true,
			isSuperUser: true,
			isEmailVerified: true,
			profile: {
				create: {},
			},
			employee: {
				create: {
					dateEmployed: new Date(),
					job: {
						connectOrCreate: {
							where: {
								name: 'CEO',
							},
							create: {
								name: 'CEO',
							},
						},
					},
				},
			},
		},
		select: {
			id: true,
		},
	});
}

const prisma = new PrismaClient();

async function main(prisma: PrismaClient) {
	const firstName = prompt('Enter First Name: ');
	const lastName = prompt('Enter Last Name: ');

	const email = await getEmail();
	const password = await getPassword();

	logger.info('Adding Superuser...');

	await create(prisma, { firstName, lastName, email, password });

	logger.success('Added Superuser Successfully...');
}

main(prisma)
	.catch((e) => {
		console.error(e);
	})
	.finally(async () => {
		await prisma.$disconnect();
		// process.exit(1);
	});
