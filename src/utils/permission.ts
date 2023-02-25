import { PermissionType } from '../types';

type OptionsType = {
	every?: boolean; // means all required permissions must be met
};

// A function to check if a user has a model level permission
export function hasModelPermission(
	userPermissions: PermissionType[],
	requiredPermissions: string[], // code names
	options?: OptionsType
): boolean {
	let hasPerm = false;
	// if not all requiredPermissions need to be met
	if (!options?.every) {
		userPermissions.forEach((permission) => {
			if (requiredPermissions.includes(permission.codename))
				return (hasPerm = true);
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

		hasPerm = trackedRequiredPermissions.every(
			(permission) => permission.checked === true
		);
	}

	return hasPerm;
}
