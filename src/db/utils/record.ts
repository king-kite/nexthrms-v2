import {
	PermissionModelChoices,
	PermissionObjectChoices,
} from '@prisma/client';
import type { NextApiRequest } from 'next';

import { getUserObjects, getUserObjectPermissions } from './permission';
import { permissions, PermissionKeyType } from '../../config';
import { ParamsType, RequestUserType, UserObjPermType } from '../../types';
import { hasModelPermission } from '../../utils';
import { validateParams } from '../../validators';

type RecordsType<DataType> = {
	status: 'success';
	message: string;
	data: DataType;
};

type RecordType<DataType> = {
	data: DataType;
	perm: UserObjPermType;
};

export async function getRecords<DataType = unknown>({
	model: modelName,
	placeholder,
	perm,
	query,
	user,
	getData,
}: {
	model: PermissionModelChoices | null;
	placeholder: DataType;
	perm: PermissionKeyType;
	query: NextApiRequest['query'] | ParamsType;
	user: Omit<RequestUserType, 'checkPassword'>;
	getData: (
		params: ParamsType & {
			where?: {
				id: {
					in: string[];
				};
			};
		}
	) => Promise<DataType>;
}): Promise<RecordsType<DataType> | null> {
	const hasViewPerm =
		user.isSuperUser ||
		hasModelPermission(user.allPermissions, [permissions[perm].VIEW]);

	// if the user has view model permissions
	if (hasViewPerm) {
		const params = validateParams(query);
		const data = await getData({ ...params });

		return {
			status: 'success',
			message: `Fetched ${modelName || 'data'} successfully.`,
			data: JSON.parse(JSON.stringify(data)),
		};
	}

	if (modelName) {
		// If the user has any view object level permissions
		const userObjects = await getUserObjects({
			modelName,
			permission: 'VIEW',
			userId: user.id,
		});

		if (userObjects.length > 0) {
			const params = validateParams(query);

			const data = (await getData({
				...params,
				where: {
					id: {
						in: userObjects.map((obj) => obj.objectId),
					},
				},
			})) as unknown as DataType;

			return {
				status: 'success',
				message: `Fetched ${modelName || 'data'} successfully.`,
				data: JSON.parse(JSON.stringify(data)),
			};
		}
	}

	// Check if the user has create model permissions and return an empty array
	// The user may not have created any record yet so it is still unwise to throw a 403 error
	const hasCreatePerm =
		user.isSuperUser ||
		hasModelPermission(user.allPermissions, [permissions[perm].CREATE]);

	if (hasCreatePerm)
		return {
			status: 'success',
			message: `Fetched ${modelName || 'data'} successfully.`,
			data: placeholder,
		};

	return null;
}

export async function getRecord<DataType = unknown>({
	model: modelName,
	objectId,
	perm,
	permission,
	user,
	getData,
}: {
	model: PermissionModelChoices;
	objectId: string;
	perm: PermissionKeyType;
	permission?: PermissionObjectChoices;
	user: Omit<RequestUserType, 'checkPassword'>;
	getData: () => Promise<DataType>;
}): Promise<RecordType<DataType> | null> {
	// Check if the user has permission to view this

	let objPerm = {
		delete: false,
		edit: false,
		view:
			user.isSuperUser ||
			hasModelPermission(user.allPermissions, [permissions[perm].VIEW]),
	};

	// If not model level then get view level
	if (!objPerm.view) {
		// check if the user has a view object permission for this record
		objPerm = await getUserObjectPermissions({
			modelName,
			objectId,
			permission,
			userId: user.id,
		});
	}

	// User has view permission either has model level or object level
	if (objPerm.view) {
		const data = (await getData()) as unknown as DataType;

		return {
			data: JSON.parse(JSON.stringify(data)),
			perm: objPerm,
		};
	}

	return null;
}

export async function hasObjectPermission({
	model: modelName,
	objectId,
	permission = 'VIEW',
	userId,
}: {
	model: PermissionModelChoices;
	objectId: string;
	permission?: PermissionObjectChoices;
	userId: string;
}) {
	const perm = await getUserObjectPermissions({
		modelName,
		objectId,
		permission,
		userId: userId,
	});
	const objPerm = permission.toLowerCase() as 'delete' | 'edit' | 'view';
	return perm[objPerm] || false;
}

export async function hasViewPermission({
	model: modelName,
	objectId,
	perm,
	user,
}: {
	model: PermissionModelChoices;
	objectId?: string;
	perm: PermissionKeyType;
	user: Omit<RequestUserType, 'checkPassword'>;
}): Promise<boolean> {
	if (user.isSuperUser) return true;
	// Check if the user has permission to view this

	const hasPerm = hasModelPermission(user.allPermissions, [
		permissions[perm].VIEW,
	]);

	if (hasPerm) return true;

	// If not model level then get view level
	// check if the user has a view object permission for this record
	if (objectId) {
		const objPerm = await getUserObjectPermissions({
			modelName,
			objectId,
			permission: 'VIEW',
			userId: user.id,
		});

		return objPerm.view;
	}

	return false;
}
