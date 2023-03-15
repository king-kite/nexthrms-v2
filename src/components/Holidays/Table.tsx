import { Table, TableHeadType, TableRowType } from 'kite-react-tailwind';
import { useEffect, useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import { FaPen, FaTrash, FaUserShield } from 'react-icons/fa';

import { permissions, HOLIDAY_OBJECT_PERMISSIONS_PAGE_URL } from '../../config';
import { useAlertContext, useAuthContext } from '../../store/contexts';
import {
	useDeleteHolidayMutation,
	useDeleteHolidaysMutation,
} from '../../store/queries';
import { HolidayType } from '../../types';
import { hasModelPermission, getStringedDate } from '../../utils';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'date' },
	{ type: 'actions', value: 'actions' },
];

type HolidayCreateType = { name: string; date: string };

const getRows = (
	data: HolidayType[],
	canViewPermissions: boolean,
	onEdit?: (id: string, initState: HolidayCreateType) => void,
	onDelete?: (id: string) => void
): TableRowType[] =>
	data.map((holiday) => {
		const actions: {
			color: string;
			icon: IconType;
			onClick?: () => void;
			link?: string;
		}[] = [];
		if (onEdit)
			actions.push({
				color: 'primary',
				icon: FaPen,
				onClick: () =>
					onEdit(holiday.id, {
						name: holiday.name,
						date: getStringedDate(holiday.date),
					}),
			});
		if (onDelete)
			actions.push({
				color: 'danger',
				icon: FaTrash,
				onClick: () => onDelete(holiday.id),
			});
		if (canViewPermissions)
			actions.push({
				color: 'info',
				icon: FaUserShield,
				link: HOLIDAY_OBJECT_PERMISSIONS_PAGE_URL(holiday.id),
			});
		return {
			id: holiday.id,
			rows: [
				{ value: holiday.name || '---' },
				{ value: new Date(holiday.date).toDateString() || '---' },
				{
					type: 'actions',
					value: actions,
				},
			],
		};
	});

type TableType = {
	holidays: HolidayType[];
	onEdit?: (id: string, initState: HolidayCreateType) => void;
};

const HolidayTable = ({ holidays, onEdit }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);

	const { open: showAlert } = useAlertContext();
	const { data: authData } = useAuthContext();

	const [canViewPermissions] = useMemo(() => {
		if (!authData) return [false];
		const canViewPermissions =
			authData.isSuperUser ||
			hasModelPermission(authData.permissions, [
				permissions.permissionobject.VIEW,
			]);
		return [canViewPermissions];
	}, [authData]);

	const { deleteHoliday } = useDeleteHolidayMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Department Deleted Successfully.',
			});
		},
		onError(error) {
			showAlert({
				message: error.message,
				type: 'danger',
			});
		},
	});

	const { deleteHolidays } = useDeleteHolidaysMutation({
		onSuccess() {
			showAlert({
				type: 'success',
				message: 'Holidays were deleted successfully!',
			});
		},
		onError(error) {
			showAlert({
				message: error.message,
				type: 'danger',
			});
		},
	});

	useEffect(() => {
		setRows(
			getRows(holidays, canViewPermissions, onEdit || undefined, deleteHoliday)
		);
	}, [holidays, onEdit, canViewPermissions, deleteHoliday]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table
				actions={{
					actions: [
						{
							onSubmit: deleteHolidays,
							title: 'Delete Holidays',
							value: 'del_hods',
						},
					],
				}}
				heads={heads}
				rows={rows}
				tick
			/>
		</div>
	);
};

export default HolidayTable;
