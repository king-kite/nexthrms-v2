import {
	Button,
	Table,
	TableHeadType,
	TableRowType,
} from 'kite-react-tailwind';
import React from 'react';
import {
	FaCheckCircle,
	FaPen,
	FaTimesCircle,
	FaTrash,
	FaUserFriends,
} from 'react-icons/fa';

import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import { useEditObjectPermissionMutation } from '../../../store/queries';
import { ObjPermGroupType, PermissionModelNameType } from '../../../types';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'view' },
	{ value: 'edit' },
	{ value: 'delete' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: ObjPermGroupType[],
	removeGroup: (id: string) => void,
	onEdit: (group: ObjPermGroupType) => void
): TableRowType[] =>
	data.map((group) => ({
		id: group.id,
		rows: [
			{ value: group.name },
			{
				options: {
					className: `${
						group.view ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.view ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						group.edit ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.edit ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						group.delete ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: group.delete ? FaCheckCircle : FaTimesCircle,
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaPen,
						onClick: () => onEdit(group),
					},
					{
						color: 'danger',
						icon: FaTrash,
						onClick: () => removeGroup(group.id),
					},
				],
			},
		],
	}));

type TableType = {
	groups: ObjPermGroupType[];
	modelName: PermissionModelNameType;
	objectId: string;
	onEdit: (group: ObjPermGroupType) => void;
	openModal: () => void;
};

const GroupPermissionsTable = ({
	groups = [],
	modelName,
	objectId,
	onEdit,
	openModal,
}: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	const { open: showAlert } = useAlertContext();
	const { open: openAlertModal, close, showLoader } = useAlertModalContext();

	const { mutate } = useEditObjectPermissionMutation(
		{ model: modelName, id: objectId },
		{
			onError(err) {
				showAlert({
					message: err.data?.groups || err.message,
					type: 'danger',
				});
			},
			onSuccess() {
				showAlert({
					message: 'Removed group successfully!',
					type: 'success',
				});
			},
		},
		{
			onSettled() {
				close();
			},
		}
	);

	const removeGroup = React.useCallback(
		(id: string) => {
			openAlertModal({
				closeOnButtonClick: false,
				header: 'Remove Group?',
				color: 'danger',
				message: 'Do you want to remove this group?',
				decisions: [
					{
						bg: 'bg-gray-600 hover:bg-gray-500',
						caps: true,
						onClick: close,
						title: 'cancel',
					},
					{
						bg: 'bg-red-600 hover:bg-red-500',
						caps: true,
						onClick: () => {
							showLoader();
							mutate([
								{
									method: 'DELETE',
									permission: 'DELETE',
									form: { groups: [id] },
								},
								{
									method: 'DELETE',
									permission: 'EDIT',
									form: { groups: [id] },
								},
								{
									method: 'DELETE',
									permission: 'VIEW',
									form: { groups: [id] },
								},
							]);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openAlertModal, close, mutate, showLoader]
	);

	React.useEffect(() => {
		setRows(getRows(groups, removeGroup, onEdit));
	}, [groups, removeGroup, onEdit]);

	return (
		<div>
			<div className="flex flex-wrap items-center w-full lg:justify-end">
				<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
					<Button
						iconLeft={FaUserFriends}
						onClick={openModal}
						rounded="rounded-xl"
						title="Add Groups"
					/>
				</div>
			</div>
			<div className="mt-2 rounded-lg py-2 md:mt-1">
				<Table heads={heads} rows={rows} />
			</div>
		</div>
	);
};

export default GroupPermissionsTable;
