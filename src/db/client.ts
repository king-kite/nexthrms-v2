import { PrismaClient } from '@prisma/client';

import { SHOW_QUERY_LOG_TIME } from '../config';

declare global {
	var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	prisma = new PrismaClient();
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient({
			// log: ['query'],
		});
	}
	prisma = global.prisma;
}

if (SHOW_QUERY_LOG_TIME)
	prisma.$use(async (params, next) => {
		const before = Date.now();
		const result = await next(params);
		const after = Date.now();

		console.log(
			`Query ${params.model}.${params.action} took ${after - before}ms`
		);
		return result;
	});

// prisma.$use(async (params, next) => {
// 	console.log('FIRST MIDDLEWARE PARAMS :>> ', params);
// 	const result = await next(params);
// 	console.log('FIRST MIDDLEWARE PARAMS 2 :>> ', params);
// 	return result;
// });

export default prisma;
