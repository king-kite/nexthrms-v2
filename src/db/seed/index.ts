import { PrismaClient } from '@prisma/client';

import functions from './functions';
import permissions from './permissions';

const prisma = new PrismaClient();

async function main() {
	// load db function first
	// await functions(prisma);

	// then load permissions
	await permissions(prisma);
}

main()
	.catch((e) => {
		console.error(e);
	})
	.finally(async () => {
		await prisma.$disconnect();
		// process.exit(1);
	});
