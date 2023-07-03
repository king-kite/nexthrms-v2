import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

// if (SHOW_QUERY_LOG_TIME)
// 	xprisma.$use(async (params, next) => {
// 		const before = Date.now();
// 		const result = await next(params);
// 		const after = Date.now();

// 		console.log(
// 			`Query ${params.model}.${params.action} took ${after - before}ms`
// 		);
// 		return result;
// 	});

// const prisma = xprisma.$extends({
// 	query: {
// 		$allModels: {
// 			async $allOperations({ model, operation, args, query }) {
// 				console.log('MODEL :>> ', model);
// 				console.log('OPERATION :>> ', operation);
// 				console.log('ARGS :>> ', args);
// 				console.log('QUERY :>> ', query);
// 				console.log('\n----------\n');
// 				return query(args);
// 			},
// 		},
// 	},
// });

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
