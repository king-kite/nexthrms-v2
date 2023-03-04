import { Button, InfoComp, InfoCompType } from 'kite-react-tailwind';
import React from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';

import { permissions, DEFAULT_IMAGE } from '../../config';
import { useAuthContext } from '../../store/contexts';
import { useGetUserObjectPermissionsQuery } from '../../store/queries';
import { AssetType } from '../../types';
import { hasModelPermission } from '../../utils';

function Details({
	asset,
	deleteAsset,
	editAsset,
}: {
	asset: AssetType;
	deleteAsset: (id: string) => void;
	editAsset: (asset: AssetType) => void;
}) {
	const { data: authData } = useAuthContext();

	const { data: objPermData, isLoading: permLoading } =
		useGetUserObjectPermissionsQuery({
			modelName: 'assets',
			objectId: asset.id,
		});

	const [canEdit, canDelete] = React.useMemo(() => {
		let canDelete = false;
		let canEdit = false;

		// Check model permissions
		if (authData && (authData.isAdmin || authData.isSuperUser)) {
			canEdit =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.EDIT]));
			canDelete =
				!!authData.isSuperUser ||
				(!!authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.DELETE]));
		}

		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canEdit && objPermData) canEdit = objPermData.edit;
		// If the user doesn't have model edit permissions, then check obj edit permission
		if (!canDelete && objPermData) canDelete = objPermData.delete;

		return [canEdit, canDelete];
	}, [authData, objPermData]);

	const infos = React.useMemo(() => {
		let data: InfoCompType['infos'] = [
			{ title: 'Asset Name', value: asset.name },
			{ title: 'Asset ID', value: asset.assetId },
			{
				title: 'Purchase Date',
				value: new Date(asset.purchaseDate).toDateString(),
			},
			{ title: 'Purchased From', value: asset.purchaseFrom },
			{ title: 'Manufacturer', value: asset.manufacturer },
			{ title: 'Model', value: asset.model || '--------' },
			{ title: 'Serial Number', value: asset.serialNo },
			{ title: 'Supplier', value: asset.supplier },
			{
				title: 'Condition',
				value: asset.condition,
				type: 'badge',
				options: {
					bg:
						asset.condition === 'BAD'
							? 'danger'
							: asset.condition === 'GOOD'
							? 'primary'
							: 'success',
				},
			},
			{ title: 'Warranty', value: asset.warranty },
			{ title: 'Value', value: asset.value },
		];
		if (asset.user) {
			const userData: InfoCompType['infos'] = [
				{
					title: 'User Image',
					type: 'image',
					value: {
						src: asset.user.profile?.image || DEFAULT_IMAGE,
						alt: asset.user.firstName + ' ' + asset.user.lastName,
					},
				},
				{
					title: 'First Name',
					value: asset.user.firstName || '-------',
				},
				{
					title: 'Last Name',
					value: asset.user.lastName || '-------',
				},
				{
					title: 'Email',
					value: asset.user.email || '-------',
				},
			];
			data = [...data, ...userData];
		}
		data = [
			...data,
			{ title: 'Description', value: asset.description || '--------' },
			{
				title: 'Status',
				value: asset.status,
				type: 'badge',
				options: {
					bg:
						asset.status === 'APPROVED'
							? 'success'
							: asset.status === 'DENIED'
							? 'danger'
							: asset.status === 'PENDING'
							? 'warning'
							: 'seoncdary',
				},
			},
		];
		return data;
	}, [asset]);

	return (
		<>
			{(canEdit || canDelete) && (
				<div className="flex items-center justify-end gap-4 my-3 w-full">
					{canEdit && (
						<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								iconLeft={FaPen}
								onClick={() => editAsset(asset)}
								padding="px-4 py-2 sm:py-3"
								title="Edit"
							/>
						</div>
					)}
					{canDelete && (
						<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
							<Button
								bg="bg-red-600 hover:bg-red-500"
								iconLeft={FaTrash}
								onClick={() => deleteAsset(asset.id)}
								padding="px-4 py-2 sm:py-3"
								title="Delete"
							/>
						</div>
					)}
				</div>
			)}
			<div className="pt-4">
				<InfoComp infos={infos} />
			</div>
		</>
	);
}

export default Details;
