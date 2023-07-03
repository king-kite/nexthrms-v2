import { PrismaClient } from '@prisma/client';
import logger from './utils/logger';
import models from './models';

async function main(prisma: PrismaClient) {
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
	const permissions = models.reduce(
		(
			acc: {
				name: string;
				codename: string;
				description: string;
				categoryName?: string;
			}[],
			model
		) => {
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
				if (model.name.toLowerCase() === 'permission') {
					modelPermissions.push({
						name: `can edit ${model.title}`.toUpperCase(),
						codename: `can_edit_${model.name}`.toLowerCase(),
						description: `Specifies whether a user can edit the permissions table. Specifically, to import permissions data.`,
						categoryName: model.name.toLowerCase(),
					});
				}

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
					description: `Specifies whether a user can add a new record on the ${model.name.toLowerCase()} table`,
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

			if (
				model.name.toLowerCase() === 'leave' ||
				model.name.toLowerCase() === 'overtime'
			) {
				modelPermissions.push(
					{
						name: `can grant ${model.title}`.toUpperCase(),
						codename: `can_grant_${model.name}`.toLowerCase(),
						description: `Specifies whether an employee can approve/deny a request for ${model.name.toLowerCase()}.`,
						categoryName: model.name.toLowerCase(),
					},
					{
						name: `can request ${model.title}`.toUpperCase(),
						codename: `can_request_${model.name}`.toLowerCase(),
						description: `Specifies whether an employee can request for ${model.name.toLowerCase()}.`,
						categoryName: model.name.toLowerCase(),
					}
				);
			}

			if (model.name.toLowerCase() === 'attendance') {
				modelPermissions.push({
					name: `can mark ${model.title}`.toUpperCase(),
					codename: `can_mark_${model.name}`.toLowerCase(),
					description: `Specifies whether an employee can clock in and out.`,
					categoryName: model.name.toLowerCase(),
				});
			}

			return [...acc, ...modelPermissions];
		},
		[]
	);

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
}

export default main;
