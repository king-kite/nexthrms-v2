import { AuthDataType, PermissionType, RequestUserType } from '../../types';

// return distinct permissions from the groups permission and user permissions;
export function getDistinctPermissions(
	permissions: PermissionType[]
): PermissionType[] {
	// A variable to store the IDs of permissions that have been found
	const permissionIds: string[] = [];

	const distinctPermissions = permissions.filter((permission) => {
		// Check to see if the permission id is not in the permissionsIds variable
		// return permission if it's not and add the id to the variable
		if (!permissionIds.includes(permission.id)) {
			permissionIds.push(permission.id);
			return permission;
		}
	});

	return distinctPermissions;
}

export function serializeUserData(
	user: Omit<RequestUserType, 'checkPassword'>
): AuthDataType {
	let data: AuthDataType = {
		firstName: user.firstName,
		lastName: user.lastName,
		fullName: user.fullName || user.firstName + ' ' + user.lastName,
		email: user.email,
		profile: user.profile
			? {
					image: user.profile.image,
			  }
			: null,
		employee: null,
		permissions: getDistinctPermissions([
			...user.permissions,
			...user.groups.reduce((acc: PermissionType[], group) => {
				return [...acc, ...group.permissions];
			}, []),
		]),
	};
	if (user.employee) {
		data.employee = {
			id: user.employee.id,
		};
		if (user.employee.job) {
			data.employee.job = {
				name: user.employee.job.name,
			};
		}
	}
	if (user.isAdmin) data.isAdmin = true;
	if (user.isSuperUser) data.isSuperUser = true;

	return data;
}
