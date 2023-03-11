import { PermissionModelChoices } from '@prisma/client';
import type { NextApiRequest } from 'next';

import { getUserObjects } from './permission';
import { permissions, PermissionKeyType } from '../../config';
import { ParamsType, RequestUserType } from '../../types';
import { hasModelPermission } from '../../utils';
import { validateParams } from '../../validators';

type RecordType<DataType> = {
	status: 'success';
	message: string;
	data: DataType;
};

export async function getRecords<DataType>({
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
	query: NextApiRequest['query'];
	user: RequestUserType;
	getData: (
		params: ParamsType & {
			where?: {
				id: {
					in: string[];
				};
			};
		}
	) => Promise<DataType>;
}): Promise<RecordType<DataType> | null> {
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
			data,
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
				data,
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