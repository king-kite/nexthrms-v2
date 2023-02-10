const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { logger } = require('./utils/index.js');

(async function main() {
	// Delete the previous groups
	logger.info('Removing Old Groups Data...');
	await prisma.group.deleteMany();

	logger.success('Removed Old Groups Successfully!');
	logger.info('Adding Groups...');

	const clientPermissions = [
		'can_view_project',

		'can_view_projectfile',
		'can_create_projectfile',
		'can_delete_projectfile',

		'can_view_projectteam',

		'can_view_projecttask',

		'can_view_projecttaskfollower',
	];

	const employeePermissions = [
		'can_view_attendance',
		'can_create_attendance',

		'can_create_leave',
		'can_view_leave',
		'can_edit_leave',
		'can_delete_leave',

		'can_create_overtime',
		'can_edit_overtime',
		'can_delete_overtime',
		'can_view_overtime',

		'can_view_project',

		'can_view_projectfile',
		'can_create_projectfile',
		'can_delete_projectfile',

		'can_view_projectteam',

		'can_view_projecttask',
		'can_edit_projecttask',

		'can_view_projecttaskfollower',
	];

	const clientGroup = await prisma.group.create({
		data: {
			name: 'client',
			description: 'This group grants permissions to clients',
			active: true,
		},
		select: { id: true },
	});

	const employeeGroup = await prisma.group.create({
		data: {
			name: 'employee',
			description: 'This group grants permissions to employees',
			active: true,
		},
		select: { id: true },
	});

	const clientGroupPromises = clientPermissions.map((codename) => {
		return prisma.group.update({
			where: { id: clientGroup.id },
			data: {
				permissions: {
					connect: { codename },
				},
			},
		});
	});

	const employeeGroupPromises = employeePermissions.map((codename) => {
		return prisma.group.update({
			where: { id: employeeGroup.id },
			data: {
				permissions: {
					connect: { codename },
				},
			},
		});
	});

	// await the promises
	await Promise.all([...clientGroupPromises, ...employeeGroupPromises]);

	logger.success('Added Groups Successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
