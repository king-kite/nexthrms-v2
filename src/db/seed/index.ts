import { PrismaClient } from '@prisma/client';

import employees from './employees';
import functions from './functions';
import groups from './groups';
import permissions from './permissions';

const prisma = new PrismaClient();

async function main() {
	// load db function first
	// await functions(prisma);

	// then load permissions
	await permissions(prisma);

	// then load groups
	await groups(prisma);

	// then load employees
	await employees(prisma);
}

main()
	.catch((e) => {
		console.error(e);
	})
	.finally(async () => {
		await prisma.$disconnect();
		// process.exit(1);
	});
