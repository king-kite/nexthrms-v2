const models = [
	{ name: 'Asset', title: 'Asset' },
	{ name: 'Attendance', title: 'Attendance' },
	{ name: 'Client', title: 'Client' },
	{ name: 'Department', title: 'Department' },
	{ name: 'Employee', title: 'Employee' },
	{ name: 'Group', title: 'Group' },
	{ name: 'Holiday', title: 'Holiday' },
	{ name: 'Job', title: 'Job' },
	{ name: 'Leave', title: 'Leave' },
	{ name: 'Notification', title: 'Notification' },
	{ name: 'Overtime', title: 'Overtime' },
	{ name: 'Permission', title: 'Permission' },
	{ name: 'PermissionCategory', title: 'Permission Category' },
	{ name: 'Profile', title: 'Profile' },
	{ name: 'Project', title: 'Project' },
	{ name: 'ProjectFile', title: 'Project File' },
	{ name: 'ProjectTeam', title: 'Project Team' },
	{ name: 'ProjectTask', title: 'Project Task' },
	{ name: 'ProjectTaskFollower', title: 'Project Task Follower' },
	{ name: 'User', title: 'User' },
];

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { logger } = require('./utils/index.js');

(async function main() {
	// Delete the previous permission categories and permissions
	await prisma.permissionCategory.deleteMany();
	await prisma.permission.deleteMany();

	// Get the new permission categories
	const categories = models.map((model) => ({
		name: model.name.toLowerCase(),
	}));

	// Add the new permission categories
	await prisma.permissionCategory.createMany({
		data: categories,
		skipDuplicates: true,
	});

	// Get the created permissions from the database
	const permissionCategories = await prisma.permissionCategory.findMany();

	// Get the new permissions
	const permissions = models.reduce((acc, model) => {
		if (model.name.toLowerCase() === 'notification') {
			const notificationPermissions = [
				{
					name: 'CAN VIEW NOTIFICATION',
					codename: 'can_view_notification',
					description: 'Can view notification associated to user',
					categoryName: 'notification',
				},
				{
					name: 'CAN DELETE NOTIFICATION',
					codename: 'can_delete_notification',
					description: 'Can delete notification associated to user',
					categoryName: 'notification',
				},
			];
			return [...acc, notificationPermissions];
		}

		if (
			model.name.toLowerCase() === 'permission' ||
			model.name.toLowerCase() === 'permissioncategory'
		) {
			let modelPermissions = [
				{
					name: `can view ${model.title}`.toUpperCase(),
					codename: `can_view_${model.name}`.toLowerCase(),
					description: `Specifies whether a user can view a record from the ${model.name.toLowerCase()} table`,
					categoryName: model.name.toLowerCase(),
				},
				{
					name: `can export ${model.title}`.toUpperCase(),
					codename: `can_export_${model.name}`.toLowerCase(),
					description: `Specifies whether a user can export records from the ${model.name.toLowerCase()} table`,
					categoryName: model.name.toLowerCase(),
				},
			];

			return [...acc, ...modelPermissions];
		}

		let modelPermissions = [
			{
				name: `can create ${model.title}`.toUpperCase(),
				codename: `can_create_${model.name}`.toLowerCase(),
				description: `Specifies whether a user can add a new record in the ${model.name.toLowerCase()} table`,
				categoryName: model.name.toLowerCase(),
			},
			{
				name: `can delete ${model.title}`.toUpperCase(),
				codename: `can_delete_${model.name}`.toLowerCase(),
				description: `Specifies whether a user can delete a record from the ${model.name.toLowerCase()} table`,
				categoryName: model.name.toLowerCase(),
			},
			{
				name: `can edit ${model.title}`.toUpperCase(),
				codename: `can_edit_${model.name}`.toLowerCase(),
				description: `Specifies whether a user can edit a record from the ${model.name.toLowerCase()} table`,
				categoryName: model.name.toLowerCase(),
			},
			{
				name: `can view ${model.title}`.toUpperCase(),
				codename: `can_view_${model.name}`.toLowerCase(),
				description: `Specifies whether a user can view a record from the ${model.name.toLowerCase()} table`,
				categoryName: model.name.toLowerCase(),
			},
			{
				name: `can export ${model.title}`.toUpperCase(),
				codename: `can_export_${model.name}`.toLowerCase(),
				description: `Specifies whether a user can export records from the ${model.name.toLowerCase()} table`,
				categoryName: model.name.toLowerCase(),
			},
		];

		if (model.name.toLowerCase() === 'user') {
			modelPermissions = [
				...modelPermissions,
				{
					name: 'CAN CHANGE USER PASSWORD',
					codename: 'can_change_user_password',
					description:
						'Specifies whether a user can change another user password.',
					categoryName: 'user',
				},
				{
					name: 'CAN ACTIVATE AND DEACTIVATE USER',
					codename: 'can_activate_and_deactivate_user',
					description:
						'Specifies whether a user can activate and deactivate another user.',
					categoryName: 'user',
				},
				{
					name: 'CAN VIEW USER GROUP',
					codename: 'can_view_user_group',
					description:
						'Specifies whether a user can view the groups associated with a user.',
					categoryName: 'user',
				},
				{
					name: 'CAN EDIT USER GROUP',
					codename: 'can_edit_user_group',
					description:
						'Specifies whether a user can edit the groups associated with a user.',
					categoryName: 'user',
				},
			];
		}

		return [...acc, ...modelPermissions];
	}, []);

	// Create a array of promises to add new permissions
	const permissionPromises = [...permissions, ...customPermissions].map(
		({ categoryName, ...permission }) => {
			const category = permissionCategories.find(
				(item) => item.name === categoryName
			);

			return prisma.permission.create({
				data: {
					...permission,
					categoryId: category ? category.id : null,
				},
			});
		}
	);

	// await the promises
	await Promise.all(permissionPromises);
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
