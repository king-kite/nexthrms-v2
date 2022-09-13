import { PrismaClient } from '@prisma/client';

declare global {
	var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient();
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient({
			log: ['query'],
		});
	}
	prisma = global.prisma;
}

// prisma.$use(async (params, next) => {
// 	console.log('FIRST MIDDLEWARE PARAMS :>> ', params);
// 	const result = await next(params);
// 	console.log('FIRST MIDDLEWARE PARAMS 2 :>> ', params);
// 	return result;
// });

export default prisma;
