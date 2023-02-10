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
		'can_edit_projectfile',

		'can_view_projectteam',

		'can_view_projecttask',
		'can_edit_projecttask',

		'can_view_projecttaskfollower',
	];

	const employeeAdminPermissions = [
		...employeePermissions,
		'can_delete_attendance',
		'can_edit_attendance',
	];

	const leadPermissions = [
		'can_view_project',
		'can_edit_project',

		'can_view_projectfile',
		'can_create_projectfile',
		'can_delete_projectfile',
		'can_edit_projectfile',

		'can_view_projectteam',
		'can_create_projectteam',
		'can_edit_projectteam',
		'can_delete_projectteam',

		'can_view_projecttask',
		'can_edit_projecttask',
		'can_delete_projecttask',
		'can_create_projecttask',

		'can_view_projecttaskfollower',
		'can_edit_projecttaskfollower',
		'can_delete_projecttaskfollower',
		'can_create_projecttaskfollower',
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

	const employeeAdminGroup = await prisma.group.create({
		data: {
			name: 'admin employee',
			description:
				'This group grants access to an admin employee. Please note that employees in this group was must be admin users.',
			active: true,
		},
		select: { id: true },
	});

	const leadGroup = await prisma.group.create({
		data: {
			name: 'lead',
			description: 'This group grants permissions to project leaders',
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

	const employeeAdminGroupPromises = employeeAdminPermissions.map(
		(codename) => {
			return prisma.group.update({
				where: { id: employeeAdminGroup.id },
				data: {
					permissions: {
						connect: { codename },
					},
				},
			});
		}
	);

	const leadGroupPromises = leadPermissions.map((codename) => {
		return prisma.group.update({
			where: { id: leadGroup.id },
			data: {
				permissions: {
					connect: { codename },
				},
			},
		});
	});

	// await the promises
	await Promise.all([
		...clientGroupPromises,
		...employeeGroupPromises,
		...employeeAdminGroupPromises,
		...leadGroupPromises,
	]);

	logger.success('Added Groups Successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
