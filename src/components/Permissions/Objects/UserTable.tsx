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
	FaUserEdit,
} from 'react-icons/fa';

import { useAlertContext, useAlertModalContext } from '../../../store/contexts';
import { useEditObjectPermissionMutation } from '../../../store/queries';
import { ObjPermUser, PermissionModelNameType } from '../../../types';
import { toCapitalize } from '../../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'email' },
	{ value: 'view' },
	{ value: 'edit' },
	{ value: 'delete' },
	{ type: 'actions', value: 'actions' },
];

const getRows = (
	data: ObjPermUser[],
	removeUser: (id: string) => void
): TableRowType[] =>
	data.map((user) => ({
		id: user.id,
		rows: [
			{ value: toCapitalize(user.firstName + ' ' + user.lastName) },
			{ value: user.email },
			{
				options: {
					className: `${
						user.view ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.view ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						user.edit ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.edit ? FaCheckCircle : FaTimesCircle,
			},
			{
				options: {
					className: `${
						user.delete ? 'text-green-600' : 'text-red-600'
					} text-sm md:text-base`,
				},
				type: 'icon',
				icon: user.delete ? FaCheckCircle : FaTimesCircle,
			},
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaPen,
					},
					{
						color: 'danger',
						icon: FaTrash,
						onClick: () => removeUser(user.id),
					},
				],
			},
		],
	}));

type TableType = {
	modelName: PermissionModelNameType;
	objectId: string;
	users: ObjPermUser[];
};

const UserPermissionsTable = ({
	users = [],
	modelName,
	objectId,
}: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	const { open: showAlert } = useAlertContext();
	const { open: openModal, close, showLoader } = useAlertModalContext();

	const { mutate } = useEditObjectPermissionMutation(
		{ model: modelName, id: objectId },
		{
			onError(err) {
				showAlert({
					message: err.data?.users || err.message,
					type: 'danger',
				});
			},
			onSuccess() {
				showAlert({
					message: 'Removed user successfully!',
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

	const removeUser = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				header: 'Remove User?',
				color: 'danger',
				message: 'Do you want to remove this user?',
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
									form: { users: [id] },
								},
								{
									method: 'DELETE',
									permission: 'EDIT',
									form: { users: [id] },
								},
								{
									method: 'DELETE',
									permission: 'VIEW',
									form: { users: [id] },
								},
							]);
						},
						title: 'proceed',
					},
				],
			});
		},
		[openModal, close, mutate, showLoader]
	);

	React.useEffect(() => {
		setRows(getRows(users, removeUser));
	}, [users, removeUser]);

	return (
		<div>
			<div className="flex flex-wrap items-center w-full lg:justify-end">
				<div className="my-2 w-full sm:px-2 sm:w-1/3 md:w-1/4">
					<Button
						iconLeft={FaUserEdit}
						rounded="rounded-xl"
						title="Add Users"
					/>
				</div>
			</div>
			<div className="mt-2 rounded-lg py-2 md:mt-1">
				<Table heads={heads} rows={rows} />
			</div>
		</div>
	);
};

export default UserPermissionsTable;