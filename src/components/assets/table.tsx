import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import Link from 'next/link';
import React from 'react';
import { IconType } from 'react-icons';
import { FaEye, FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import {
	permissions,
	ASSET_OBJECT_PERMISSIONS_PAGE_URL,
	USER_PAGE_URL,
} from '../../config';
import { useAuthContext } from '../../store/contexts';
import { AssetType } from '../../types';
import { getStringedDate, hasModelPermission } from '../../utils';

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
		getObjPermLink,
	}: {
		deleteAsset?: (id: string) => void;
		editAsset?: (asset: AssetType) => void;
		showAsset: (asset: AssetType) => void;
		getObjPermLink?: (id: string) => string;
	}
): TableRowType[] =>
	data.map((asset) => {
		const actions: {
			color: string;
			icon: IconType;
			onClick?: () => void;
			link?: string;
		}[] = [
			{
				color: 'primary',
				icon: FaEye,
				onClick: () => showAsset(asset),
			},
		];
		if (editAsset) {
			actions.push({
				color: 'primary',
				icon: FaPen,
				onClick: () => editAsset(asset),
			});
		}
		if (deleteAsset) {
			actions.push({
				color: 'danger',
				icon: FaTrash,
				onClick: () => deleteAsset(asset.id),
			});
		}
		if (getObjPermLink) {
			actions.push({
				color: 'info',
				icon: FaUserShield,
				link: getObjPermLink(asset.id),
			});
		}

		return {
			id: asset.id,
			onClick(e) {
				const tagName = (e.target as HTMLElement).tagName.toLowerCase();
				switch (tagName) {
					case 'a':
					case 'path':
					case 'section':
					case 'span':
					case 'svg':
						break;
					default:
						showAsset(asset);
				}
			},
			rows: [
				{ value: asset.name || '---' },
				{
					link: asset.user ? USER_PAGE_URL(asset.user.id) : undefined,
					value: asset.user
						? `${asset.user.firstName} ${asset.user.lastName}`
						: '---',
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
						? getStringedDate(asset.purchaseDate)
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
				{ value: asset.serialNo || '---' },
				{
					value: asset.updatedAt ? getStringedDate(asset.updatedAt) : '---',
				},
				{
					type: 'actions',
					value: actions,
				},
			],
		};
	});

type TableType = {
	assets: AssetType[];
	offset?: number;
	deleteAsset: (id: string) => void;
	editAsset: (asset: AssetType) => void;
	showAsset: (asset: AssetType) => void;
};

const AssetTable = ({
	assets,
	deleteAsset,
	editAsset,
	offset = 0,
	showAsset,
}: TableType) => {
	const { data: authData } = useAuthContext();

	// has model permission
	const [canEdit, canDelete, canViewObjectPermissions] = React.useMemo(() => {
		const canEdit = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.EDIT]))
			: false;
		const canDelete = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [permissions.asset.DELETE]))
			: false;
		const canViewObjectPermissions = authData
			? authData.isSuperUser ||
			  (authData.isAdmin &&
					hasModelPermission(authData.permissions, [
						permissions.permissionobject.VIEW,
					]))
			: false;
		return [canEdit, canDelete, canViewObjectPermissions];
	}, [authData]);

	const [activeRow, setActiveRow] = React.useState<
		'all' | 'approved' | 'denied' | 'pending' | 'returned'
	>('all');
	const { offset: deferredOffset, assets: deferredValue } =
		React.useDeferredValue({ assets, offset });
	const rows = React.useMemo(() => {
		let finalList;
		if (activeRow === 'approved') {
			finalList = deferredValue.filter((asset) => asset.status === 'APPROVED');
		} else if (activeRow === 'denied') {
			finalList = deferredValue.filter((asset) => asset.status === 'DENIED');
		} else if (activeRow === 'pending') {
			finalList = deferredValue.filter((asset) => asset.status === 'PENDING');
		} else if (activeRow === 'returned') {
			finalList = deferredValue.filter((asset) => asset.status === 'RETURNED');
		} else {
			finalList = deferredValue;
		}
		return getRows(finalList, {
			deleteAsset: canDelete ? deleteAsset : undefined,
			editAsset: canEdit ? editAsset : undefined,
			getObjPermLink: canViewObjectPermissions
				? ASSET_OBJECT_PERMISSIONS_PAGE_URL
				: undefined,
			showAsset,
		});
	}, [
		activeRow,
		deferredValue,
		deleteAsset,
		editAsset,
		showAsset,
		canViewObjectPermissions,
		canEdit,
		canDelete,
	]);

	return (
		<Table
			heads={heads}
			rows={rows}
			options={{
				rows: {
					hover: true,
				},
			}}
			sn={deferredOffset}
			renderActionLinkAs={({ link, children, ...props }) => (
				<Link href={link}>
					<a {...props}>{children}</a>
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
	);
};

export default AssetTable;
