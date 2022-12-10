import { InfoComp, InfoCompType } from 'kite-react-tailwind';
import React from 'react';
import { DEFAULT_IMAGE } from '../../config';
import { AssetType } from '../../types';

function Details({ asset }: { asset: AssetType }) {
	const infos = React.useMemo(() => {
		let data: InfoCompType['infos'] = [
			{ title: 'Asset Name', value: asset.name },
			{ title: 'Asset ID', value: asset.assetId },
			{ title: 'Purchase Date', value: asset.purchaseDate },
			{ title: 'Purchased Form', value: asset.purchaseFrom },
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
		<div>
			<InfoComp infos={infos} />
		</div>
	);
}

export default Details;
