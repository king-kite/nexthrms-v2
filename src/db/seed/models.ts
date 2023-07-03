import type { PermissionModelChoices } from '@prisma/client';

const models: {
	map: PermissionModelChoices | null;
	name: string;
	title: string;
}[] = [
	{ map: 'assets', name: 'Asset', title: 'Asset' },
	{ map: 'attendance', name: 'Attendance', title: 'Attendance' },
	{ map: 'clients', name: 'Client', title: 'Client' },
	{ map: 'departments', name: 'Department', title: 'Department' },
	{ map: 'employees', name: 'Employee', title: 'Employee' },
	{ map: 'groups', name: 'Group', title: 'Group' },
	{ map: 'holiday', name: 'Holiday', title: 'Holiday' },
	{ map: 'jobs', name: 'Job', title: 'Job' },
	{ map: 'leaves', name: 'Leave', title: 'Leave' },
	{ map: 'managed_files', name: 'ManagedFile', title: 'Managed File' },
	// { name: 'Notification', title: 'Notification' },
	{ map: 'overtime', name: 'Overtime', title: 'Overtime' },
	{ map: 'permissions', name: 'Permission', title: 'Permission' },
	{ map: null, name: 'PermissionCategory', title: 'Permission Category' },
	{ map: null, name: 'PermissionObject', title: 'Permission Object' },
	// { name: 'Profile', title: 'Profile' },
	{ map: 'projects', name: 'Project', title: 'Project' },
	{ map: 'projects_files', name: 'ProjectFile', title: 'Project File' },
	{ map: 'projects_tasks', name: 'ProjectTask', title: 'Project Task' },
	{ map: 'users', name: 'User', title: 'User' },
];

// // Returns the @@map() table name in the database if found else null
// export function getModelMap(choice: string): PermissionModelChoices | null {
// 	const found = models.find(
// 		(model) => model.name.toLowerCase() === choice.toLowerCase()
// 	);
// 	if (!found || !found.map) return null;
// 	return found.map;
// }

export default models;
