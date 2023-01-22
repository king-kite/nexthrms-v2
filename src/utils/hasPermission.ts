import { PermissionType } from '../types';

type OptionsType = {
	every?: boolean; // means all required permissions must be met
};

function hasPermission(
	userPermissions: PermissionType[],
	requiredPermissions: string[],
	options?: OptionsType
): boolean {
	// if not all requiredPermissions need to be met
	if (!options?.every) {
		userPermissions.forEach((permission) => {
			if (requiredPermissions.includes(permission.codename)) return true;
		});
	} else {
		// keep track of the required permissions using a checked value
		const trackedRequiredPermissions = requiredPermissions.map((permission) => {
			const userPermission = userPermissions.find(
				(userPermission) => userPermission.codename === permission
			);

			return {
				codename: permission,
				checked: !!userPermission, // checked, the permission is not in the userPermissions
			};
		});

		return trackedRequiredPermissions.every(
			(permission) => permission.checked === true
		);
	}

	return false;
}

export default hasPermission;
