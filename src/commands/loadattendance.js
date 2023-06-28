const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { getEmail, logger } = require('./utils/index.js');

(async function main() {
	logger.info('Adding Attendance Data...');

	// get the user email adderss
	const email = await getEmail();

	const user = await prisma.user.findUniqueOrThrow({
		where: { email },
		include: {
			employee: true,
		},
	});

	// get the current date
	const date = new Date();

	// get the date at the start of the month
	const startDate = new Date(date.getFullYear(), date.getMonth(), 1);

	const punchIn = new Date(0);
	punchIn.setHours(8);
	const punchOut = new Date(0);
	punchOut.setHours(18);

	// get the attendance from start of the month till date
	const attendance = [
		{
			employeeId: user.employee.id,
			date: startDate,
			punchIn,
			punchOut,
		},
	];

	// Check if the start date is not equal to the current date.
	if (date.getDate() > 1) {
		for (let i = 2; i <= date.getDate(); i++) {
			const nowDate = new Date(date.getFullYear(), date.getMonth(), i);
			const data = {
				date: nowDate,
				employeeId: user.employee.id,
				punchIn,
				punchOut:
					nowDate.getDate() !== date.getDate() || nowDate.getHours() > 18
						? punchOut
						: null,
			};
			attendance.push(data);
		}
	}

	await prisma.attendance.createMany({
		data: attendance,
		skipDuplicates: true,
	});

	logger.success('Added Attendance Data Successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
