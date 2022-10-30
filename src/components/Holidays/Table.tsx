import { Table, TableHeadType, TableRowType } from '@king-kite/react-kit';
import { useEffect, useState } from 'react';
import { FaPen, FaTrash } from 'react-icons/fa';

import { useAlertContext } from '../../store/contexts';
import {
	useDeleteHolidayMutation,
	useDeleteHolidaysMutation,
} from '../../store/queries';
import { HolidayType } from '../../types';

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'date' },
	{ type: 'actions', value: 'actions' },
];

type HolidayCreateType = { name: string; date: string };

const getRows = (
	data: HolidayType[],
	onEdit: (id: string, initState: HolidayCreateType) => void,
	onDelete: (id: string) => void
): TableRowType[] =>
	data.map((holiday) => ({
		id: holiday.id,
		rows: [
			{ value: holiday.name || '---' },
			{ value: new Date(holiday.date).toDateString() || '---' },
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						icon: FaPen,
						onClick: () =>
							onEdit(holiday.id, {
								name: holiday.name,
								date: new Date(holiday.date).toLocaleDateString('en-CA'),
							}),
					},
					{
						color: 'danger',
						icon: FaTrash,
						onClick: () => onDelete(holiday.id),
					},
				],
			},
		],
	}));

type TableType = {
	holidays: HolidayType[];
	onEdit: (id: string, initState: HolidayCreateType) => void;
};

const HolidayTable = ({ holidays, onEdit }: TableType) => {
	const [rows, setRows] = useState<TableRowType[]>([]);

	const { open: showAlert } = useAlertContext();

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
		setRows(getRows(holidays, onEdit, deleteHoliday));
	}, [holidays, onEdit, deleteHoliday]);

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
