import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaEye, FaPen, FaTrash } from 'react-icons/fa';

import { USER_PAGE_URL } from '../../config';
import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import { useDeleteAssetMutation } from '../../store/queries';
import { AssetType } from '../../types';

const heads: TableHeadType = [
	{ value: 'asset name' },
	{ value: 'asset user' },
	{ value: 'asset id' },
	{ value: 'condition' },
	{ value: 'value' },
	{ value: 'warranty (in months)' },
	{ value: 'purchase date' },
	{ value: 'status' },
	{ value: 'serial no.' },
	{ value: 'last update' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: AssetType[],
	{
		editAsset,
		deleteAsset,
		showAsset,
	}: {
		deleteAsset: (id: string) => void;
		editAsset: (asset: AssetType) => void;
		showAsset: (asset: AssetType) => void;
	}
): TableRowType[] =>
	data.map((asset) => ({
		id: asset.id,
		rows: [
			{
				value: asset.name || '---',
			},
			{
				link: asset.user ? USER_PAGE_URL(asset.user.id) : undefined,
				value: asset.user ? asset.user.firstName + asset.user.lastName : '---',
			},
			{ value: asset.assetId || '---' },
			{
				options: {
					bg:
						asset.condition === 'BAD'
							? 'danger'
							: asset.condition === 'GOOD'
							? 'primary'
							: 'success',
				},
				type: 'badge',
				value: asset.condition,
			},
			{ value: asset.value || '---' },
			{ value: asset.warranty || '---' },
			{
				value: asset.purchaseDate
					? new Date(asset.purchaseDate).toLocaleDateString('en-Ca')
					: '---',
			},
			{
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
				type: 'badge',
				value: asset.status,
			},
			{
				value: asset.updatedAt
					? new Date(asset.updatedAt).toLocaleDateString('en-Ca')
					: '---',
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaEye,
						onClick: () => showAsset(asset),
					},
					{
						color: 'primary',
						icon: FaPen,
						onClick: () => editAsset(asset),
					},
					{
						color: 'danger',
						icon: FaTrash,
						onClick: () => deleteAsset(asset.id),
					},
				],
			},
		],
	}));

type TableType = {
	assets: AssetType[];
	editAsset: (asset: AssetType) => void;
	showAsset: (asset: AssetType) => void;
};

const AssetTable = ({ assets, editAsset, showAsset }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);
	const [activeRow, setActiveRow] = useState<
		'all' | 'approved' | 'denied' | 'pending' | 'returned'
	>('all');

	const { open: openAlert } = useAlertContext();
	const { close: closeModal, open: openModal } = useAlertModalContext();

	const { deleteAsset } = useDeleteAssetMutation({
		onSuccess() {
			openModal({
				color: 'success',
				decisions: [
					{
						color: 'success',
						title: 'OK',
						onClick: closeModal,
					},
				],
				Icon: FaCheckCircle,
				header: 'Asset Removed',
				message: 'Asset Removed Successfully.',
			});
		},
		onError(error) {
			closeModal();
			openAlert({
				message: error.message,
				type: 'danger',
			});
		},
	});

	useEffect(() => {
		let finalList;
		if (activeRow === 'approved') {
			finalList = assets.filter((asset) => asset.status === 'APPROVED');
		} else if (activeRow === 'denied') {
			finalList = assets.filter((asset) => asset.status === 'DENIED');
		} else if (activeRow === 'pending') {
			finalList = assets.filter((asset) => asset.status === 'PENDING');
		} else if (activeRow === 'returned') {
			finalList = assets.filter((asset) => asset.status === 'RETURNED');
		} else {
			finalList = assets;
		}
		setRows(getRows(finalList, { deleteAsset, editAsset, showAsset }));
	}, [activeRow, assets, deleteAsset, editAsset, showAsset]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table
				heads={heads}
				rows={rows}
				renderActionLinkAs={({ link, props, children }) => (
					<Link href={link}>
						<a className={props.className} style={props.style}>
							{children}
						</a>
					</Link>
				)}
				renderContainerLinkAs={(props) => (
					<Link href={props.link}>
						<a className={props.className}>{props.children}</a>
					</Link>
				)}
				split={{
					actions: [
						{
							active: activeRow === 'all',
							onClick: () => setActiveRow('all'),
							title: 'all',
						},
						{
							active: activeRow === 'approved',
							onClick: () => setActiveRow('approved'),
							title: 'approved',
						},
						{
							active: activeRow === 'denied',
							onClick: () => setActiveRow('denied'),
							title: 'denied',
						},
						{
							active: activeRow === 'pending',
							onClick: () => setActiveRow('pending'),
							title: 'pending',
						},
						{
							active: activeRow === 'returned',
							onClick: () => setActiveRow('returned'),
							title: 'returned',
						},
					],
				}}
			/>
		</div>
	);
};

export default AssetTable;
