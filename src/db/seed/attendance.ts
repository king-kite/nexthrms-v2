import { PrismaClient } from '@prisma/client';

import logger from './utils/logger';

async function main(prisma: PrismaClient) {
	logger.info('Adding Attendance Data...');

	const employees = await prisma.employee.findMany({
		select: { id: true },
	});

	// get the current date
	const date = new Date();

	// get the date at the start of the month
	const startDate = new Date(date.getFullYear(), date.getMonth(), 1);

	// Delete the old attendance
	await prisma.attendance.deleteMany();

	const punchIn = new Date(0);
	punchIn.setHours(8);
	const punchOut = new Date(0);
	punchOut.setHours(18);

	// get the attendance from start of the month till date
	const attendance: {
		date: Date;
		punchIn: Date;
		punchOut?: Date;
	}[] = [
		{
			date: startDate,
			punchIn,
			punchOut,
		},
	];

	// Check if the start date is not equal to the current date.
	if (date.getDate() > 1) {
		for (let i = 2; i <= date.getDate(); i++) {
			const nowDate = new Date(date.getFullYear(), date.getMonth(), i);
			// Not a sunday
			if (nowDate.getDay() !== 0) {
				const data = {
					date: nowDate,
					punchIn,
					punchOut:
						nowDate.getDate() !== date.getDate() || nowDate.getHours() > 18
							? punchOut
							: undefined,
				};
				attendance.push(data);
			}
		}
	}

	const data = employees.map((employee) => {
		const input = attendance.map((item) => ({
			...item,
			employeeId: employee.id,
		}));
		return prisma.attendance.createMany({
			data: input,
			skipDuplicates: true,
		});
	});

	await prisma.$transaction(data);

	logger.success('Added Attendance Data Successfully!');
}

export default main;
