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
	// { name: 'Notification', title: 'Notification' },
	{ name: 'Overtime', title: 'Overtime' },
	{ name: 'Permission', title: 'Permission' },
	{ name: 'PermissionCategory', title: 'Permission Category' },
	{ name: 'PermissionObject', title: 'Permission Object' },
	// { name: 'Profile', title: 'Profile' },
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
	logger.info('Removing Old Permissions Data...');
	await prisma.permissionCategory.deleteMany();
	await prisma.permission.deleteMany();

	logger.success('Removed Old Permissions Successfully!');

	// Get the new permission categories
	const categories = models.map((model) => ({
		name: model.name.toLowerCase(),
	}));

	logger.info('Adding Permission Categories...');

	// Add the new permission categories
	await prisma.permissionCategory.createMany({
		data: categories,
		skipDuplicates: true,
	});

	logger.success('Added Permission Categories!');
	logger.info('Adding Permissions...');

	// Get the created permissions from the database
	const permissionCategories = await prisma.permissionCategory.findMany();

	// Get the new permissions
	const permissions = models.reduce((acc, model) => {
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

		if (model.name.toLowerCase() === 'permissionobject') {
			let modelPermissions = [
				{
					name: `can view ${model.title}`.toUpperCase(),
					codename: `can_view_${model.name}`.toLowerCase(),
					description: `Specifies whether a user can view records from the object permissions table`,
					categoryName: model.name.toLowerCase(),
				},
				{
					name: `can edit ${model.title}`.toUpperCase(),
					codename: `can_edit_${model.name}`.toLowerCase(),
					description: `Specifies whether a user can edit records from the object permissions table`,
					categoryName: model.name.toLowerCase(),
				},
			];

			return [...acc, ...modelPermissions];
		}

		const modelPermissions = [
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

		return [...acc, ...modelPermissions];
	}, []);

	// Add the api documentation permission
	permissions.push({
		name: `can view api documentation`.toUpperCase(),
		codename: `can_view_api_documentation`.toLowerCase(),
		description: `Specifies whether a user can view the API Documentation`,
	});

	// Create a array of promises to add new permissions
	const permissionPromises = permissions.map(
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

	logger.success('Added Permissions Successfully!');
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

// const models = [
// 	{ name: 'Asset', title: 'Asset' },
// 	{ name: 'Attendance', title: 'Attendance' },
// 	{ name: 'Client', title: 'Client' },
// 	{ name: 'Department', title: 'Department' },
// 	{ name: 'Employee', title: 'Employee' },
// 	{ name: 'Group', title: 'Group' },
// 	{ name: 'Holiday', title: 'Holiday' },
// 	{ name: 'Job', title: 'Job' },
// 	{ name: 'Leave', title: 'Leave' },
// 	// { name: 'Notification', title: 'Notification' },
// 	{ name: 'Overtime', title: 'Overtime' },
// 	{ name: 'Permission', title: 'Permission' },
// 	{ name: 'PermissionCategory', title: 'Permission Category' },
// 	{ name: 'PermissionObject', title: 'Permission Object' },
// 	// { name: 'Profile', title: 'Profile' },
// 	{ name: 'Project', title: 'Project' },
// 	{ name: 'ProjectFile', title: 'Project File' },
// 	{ name: 'ProjectTeam', title: 'Project Team' },
// 	{ name: 'ProjectTask', title: 'Project Task' },
// 	{ name: 'ProjectTaskFollower', title: 'Project Task Follower' },
// 	{ name: 'User', title: 'User' },
// ];

// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const { logger } = require('./utils/index.js');

// (async function main() {
// 	// Delete the previous permission categories and permissions
// 	logger.info('Removing Old Permissions Data...');
// 	await prisma.permissionCategory.deleteMany();
// 	await prisma.permission.deleteMany();

// 	logger.success('Removed Old Permissions Successfully!');

// 	// Get the new permission categories
// 	const categories = models.map((model) => ({
// 		name: model.name.toLowerCase(),
// 	}));

// 	logger.info('Adding Permission Categories...');

// 	// Add the new permission categories
// 	await prisma.permissionCategory.createMany({
// 		data: categories,
// 		skipDuplicates: true,
// 	});

// 	logger.success('Added Permission Categories!');
// 	logger.info('Adding Permissions...');

// 	// Get the created permissions from the database
// 	const permissionCategories = await prisma.permissionCategory.findMany();

// 	// Get the new permissions
// 	const permissions = models.reduce((acc, model) => {
// Doesn't make sense. A user should be able to see notifications concerning himself/herself
// as long as the user is active
// 		if (model.name.toLowerCase() === 'notification') {
// 			const notificationPermissions = [
// 				{
// 					name: 'CAN VIEW NOTIFICATION',
// 					codename: 'can_view_notification',
// 					description: 'Can view notification associated to user',
// 					categoryName: 'notification',
// 				},
// 				{
// 					name: 'CAN DELETE NOTIFICATION',
// 					codename: 'can_delete_notification',
// 					description: 'Can delete notification associated to user',
// 					categoryName: 'notification',
// 				},
// 			];
// 			return [...acc, ...notificationPermissions];
// 		}

// 		// if (model.name.toLowerCase() === 'attendance') {
// 		// 	const attendancePermissions = [
// 		// 		{
// 		// 			name: `can create ${model.title}`.toUpperCase(),
// 		// 			codename: `can_create_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can clock in and clock out on the attendance table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can view ${model.title}`.toUpperCase(),
// 		// 			codename: `can_view_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can view his/her attendance records`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can create admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_create_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can add a new record in the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can delete admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_delete_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can delete a record from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can edit admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_edit_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can edit a record from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can view admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_view_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can view a record from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can export admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_export_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can export records from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 	];
// 		// 	return [...acc, ...attendancePermissions];
// 		// }

// 		// if (
// 		// 	model.name.toLowerCase() === 'leave' ||
// 		// 	model.name.toLowerCase() === 'overtime'
// 		// ) {
// 		// 	const modelName = model.name.toLowerCase();
// 		// 	const modelPermissions = [
// 		// 		{
// 		// 			name: `can create ${model.title}`.toUpperCase(),
// 		// 			codename: `can_create_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can add new ${modelName} request`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can delete ${model.title}`.toUpperCase(),
// 		// 			codename: `can_delete_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can remove his/her ${modelName} record`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can edit ${model.title}`.toUpperCase(),
// 		// 			codename: `can_edit_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can edit his/her ${modelName} record`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can view ${model.title}`.toUpperCase(),
// 		// 			codename: `can_view_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can view his/her ${modelName} records`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can create admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_create_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can add a new record in the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can delete admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_delete_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can delete a record from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can edit admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_edit_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can edit a record from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can view admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_view_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can view a record from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 		{
// 		// 			name: `can export admin ${model.title}`.toUpperCase(),
// 		// 			codename: `can_export_admin_${model.name}`.toLowerCase(),
// 		// 			description: `Specifies whether a user can export records from the ${model.name.toLowerCase()} table`,
// 		// 			categoryName: model.name.toLowerCase(),
// 		// 		},
// 		// 	];
// 		// 	return [...acc, ...modelPermissions];
// 		// }

// 		if (
// 			model.name.toLowerCase() === 'permission' ||
// 			model.name.toLowerCase() === 'permissioncategory'
// 		) {
// 			let modelPermissions = [
// 				{
// 					name: `can view ${model.title}`.toUpperCase(),
// 					codename: `can_view_${model.name}`.toLowerCase(),
// 					description: `Specifies whether a user can view a record from the ${model.name.toLowerCase()} table`,
// 					categoryName: model.name.toLowerCase(),
// 				},
// 				{
// 					name: `can export ${model.title}`.toUpperCase(),
// 					codename: `can_export_${model.name}`.toLowerCase(),
// 					description: `Specifies whether a user can export records from the ${model.name.toLowerCase()} table`,
// 					categoryName: model.name.toLowerCase(),
// 				},
// 			];

// 			return [...acc, ...modelPermissions];
// 		}

// 		if (model.name.toLowerCase() === 'permissionobject') {
// 			let modelPermissions = [
// 				{
// 					name: `can view ${model.title}`.toUpperCase(),
// 					codename: `can_view_${model.name}`.toLowerCase(),
// 					description: `Specifies whether a user can view records from the object permissions table`,
// 					categoryName: model.name.toLowerCase(),
// 				},
// 				{
// 					name: `can edit ${model.title}`.toUpperCase(),
// 					codename: `can_edit_${model.name}`.toLowerCase(),
// 					description: `Specifies whether a user can edit records from the object permissions table`,
// 					categoryName: model.name.toLowerCase(),
// 				},
// 			];

// 			return [...acc, ...modelPermissions];
// 		}

// 		let modelPermissions = [
// 			{
// 				name: `can create ${model.title}`.toUpperCase(),
// 				codename: `can_create_${model.name}`.toLowerCase(),
// 				description: `Specifies whether a user can add a new record in the ${model.name.toLowerCase()} table`,
// 				categoryName: model.name.toLowerCase(),
// 			},
// 			{
// 				name: `can delete ${model.title}`.toUpperCase(),
// 				codename: `can_delete_${model.name}`.toLowerCase(),
// 				description: `Specifies whether a user can delete a record from the ${model.name.toLowerCase()} table`,
// 				categoryName: model.name.toLowerCase(),
// 			},
// 			{
// 				name: `can edit ${model.title}`.toUpperCase(),
// 				codename: `can_edit_${model.name}`.toLowerCase(),
// 				description: `Specifies whether a user can edit a record from the ${model.name.toLowerCase()} table`,
// 				categoryName: model.name.toLowerCase(),
// 			},
// 			{
// 				name: `can view ${model.title}`.toUpperCase(),
// 				codename: `can_view_${model.name}`.toLowerCase(),
// 				description: `Specifies whether a user can view a record from the ${model.name.toLowerCase()} table`,
// 				categoryName: model.name.toLowerCase(),
// 			},
// 			{
// 				name: `can export ${model.title}`.toUpperCase(),
// 				codename: `can_export_${model.name}`.toLowerCase(),
// 				description: `Specifies whether a user can export records from the ${model.name.toLowerCase()} table`,
// 				categoryName: model.name.toLowerCase(),
// 			},
// 		];

// 		if (model.name.toLowerCase() === 'user') {
// 			modelPermissions = [
// 				...modelPermissions,
// 				// Use can_edit_user permission instead for changing password and activate/deactivate
// 				//

// 				// {
// 				// 	name: 'CAN CHANGE USER PASSWORD',
// 				// 	codename: 'can_change_user_password',
// 				// 	description:
// 				// 		'Specifies whether a user can change another user password.',
// 				// 	categoryName: 'user',
// 				// },
// 				// {
// 				// 	name: 'CAN ACTIVATE AND DEACTIVATE USER',
// 				// 	codename: 'can_activate_and_deactivate_user',
// 				// 	description:
// 				// 		'Specifies whether a user can activate and deactivate another user.',
// 				// 	categoryName: 'user',
// 				// },

// 				// Removed this. Use can view group permission instead.
// 				// Hint: Use object level permissions

// 				// {
// 				// 	name: 'CAN VIEW USER GROUP',
// 				// 	codename: 'can_view_user_group',
// 				// 	description:
// 				// 		'Specifies whether a user can view the groups associated with a user.',
// 				// 	categoryName: 'user',
// 				// },
// 				// {
// 				// 	name: 'CAN EDIT USER GROUP',
// 				// 	codename: 'can_edit_user_group',
// 				// 	description:
// 				// 		'Specifies whether a user can edit the groups associated with a user.',
// 				// 	categoryName: 'user',
// 				// },
// 			];
// 		}

// 		return [...acc, ...modelPermissions];
// 	}, []);

// 	// Create a array of promises to add new permissions
// 	const permissionPromises = permissions.map(
// 		({ categoryName, ...permission }) => {
// 			const category = permissionCategories.find(
// 				(item) => item.name === categoryName
// 			);

// 			return prisma.permission.create({
// 				data: {
// 					...permission,
// 					categoryId: category ? category.id : null,
// 				},
// 			});
// 		}
// 	);

// 	// await the promises
// 	await Promise.all(permissionPromises);

// 	logger.success('Added Permissions Successfully!');
// })()
// 	.catch((error) => {
// 		logger.error(error.message);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});