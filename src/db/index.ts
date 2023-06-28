// import { PrismaClient } from '@prisma/client';

// import { SHOW_QUERY_LOG_TIME } from '../config';

// declare global {
// 	var prisma: PrismaClient | undefined;
// }

// let prisma: PrismaClient;

// if (process.env.NODE_ENV === 'production') {
// 	prisma = new PrismaClient();
// } else {
// 	if (!global.prisma) {
// 		global.prisma = new PrismaClient({
// 			// log: ['query'],
// 			datasources: {
// 				db: {

// 					config: {
// 						maxConcurrentQueries: process.env.DATABASE_CONNECTION_LIMIT
// 							? +process.env.DATABASE_CONNECTION_LIMIT
// 							: undefined,
// 					},
// 					provider: process.env.DATABASE_TYPE || 'postgresql',
// 					url: process.env.DATABASE_URL,
// 				},
// 			},
// 		});
// 	}
// 	prisma = global.prisma;
// }

// if (SHOW_QUERY_LOG_TIME)
// 	prisma.$use(async (params, next) => {
// 		const before = Date.now();
// 		const result = await next(params);
// 		const after = Date.now();

// 		console.log(
// 			`Query ${params.model}.${params.action} took ${after - before}ms`
// 		);
// 		return result;
// 	});

// export default prisma;

import { PrismaClient } from '@prisma/client';

import { SHOW_QUERY_LOG_TIME } from '../config';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
