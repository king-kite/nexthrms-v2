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
	{ name: 'Permission', title: 'Permission Category' },
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
		];

		return [...acc, ...modelPermissions];
	}, []);

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
})()
	.catch((error) => {
		logger.error(error.message);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
