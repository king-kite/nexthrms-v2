import {
	Button,
	Table,
	TableHeadType,
	TableRowType,
} from 'kite-react-tailwind';
import React from 'react';
import {
	FaCheckCircle,
	FaExclamationCircle,
	FaPen,
	FaTrash,
} from 'react-icons/fa';

import { useAlertContext, useAlertModalContext } from '../../store/contexts';
import {
	useDeleteDepartmentMutation,
	useDeleteDepartmentsMutation,
} from '../../store/queries';
import { toCapitalize } from '../../utils';
import { DepartmentType } from '../../types/departments';

const getRows = (
	data: DepartmentType[],
	updateDep: (data: { id: string; name: string; hod: string | null }) => void,
	deleteDep: (id: string) => void,
	disableAction: boolean
): TableRowType[] =>
	data.map((department) => ({
		id: department.id,
		rows: [
			{ value: department.name },
			{
				value: department.hod
					? department.hod.user.firstName + ' ' + department.hod.user.lastName
					: '---',
			},
			{ value: department._count.employees },
			{
				type: 'actions',
				value: [
					{
						color: 'primary',
						disabled: disableAction,
						icon: FaPen,
						onClick: () =>
							updateDep({
								id: department.id,
								name: toCapitalize(department.name),
								hod: department.hod ? department.hod.id : null,
							}),
					},
					{
						color: 'danger',
						disabled: disableAction,
						icon: FaTrash,
						onClick: () => deleteDep(department.id),
					},
				],
			},
		],
	}));

type TableType = {
	departments: DepartmentType[];
	updateDep: (data: { id: string; name: string; hod: string | null }) => void;
};

const heads: TableHeadType = [
	{ value: 'name' },
	{ value: 'head of department' },
	{ value: 'no. of employees' },
	{ type: 'actions', value: 'edit' },
];

const DepartmentTable = ({ departments = [], updateDep }: TableType) => {
	const [rows, setRows] = React.useState<TableRowType[]>([]);

	const { open: openAlert } = useAlertContext();
	const {
		close: closeModal,
		open: openModal,
		showLoader,
	} = useAlertModalContext();

	const { mutate: deleteDepartment, isLoading: depLoading } =
		useDeleteDepartmentMutation({
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
					header: 'Department Deleted',
					message: 'Department Deleted Successfully.',
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

	const { mutate: deleteDepartments, isLoading: depsLoading } =
		useDeleteDepartmentsMutation({
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
					header: 'Departments Deleted',
					message: 'Departments were deleted successfully!',
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

	const handleDelete = React.useCallback(
		(id: string) => {
			openModal({
				closeOnButtonClick: false,
				color: 'warning',
				decisions: [
					{
						color: 'danger',
						disabled: depLoading,
						onClick: () => {
							showLoader();
							deleteDepartment(id);
						},
						title: 'Confirm',
					},
					{
						color: 'info',
						disabled: depLoading,
						onClick: closeModal,
						title: 'Cancel',
					},
				],
				Icon: FaExclamationCircle,
				header: 'Delete Department?',
				message: 'Do you want to delete this Department?.',
			});
		},
		[closeModal, depLoading, openModal, deleteDepartment, showLoader]
	);

	const handleDeleteMultiple = React.useCallback(
		(ids: string[]) => {
			if (ids.length > 0) {
				openModal({
					color: 'warning',
					closeOnButtonClick: false,
					decisions: [
						{
							color: 'danger',
							disabled: depsLoading,
							onClick: () => {
								showLoader();
								deleteDepartments(ids);
							},
							title: 'Confirm',
						},
						{
							color: 'info',
							disabled: depsLoading,
							onClick: closeModal,
							title: 'Cancel',
						},
					],
					Icon: FaExclamationCircle,
					header: 'Delete selected departments?',
					message: 'Do you want to delete selected departments?.',
				});
			}
		},
		[closeModal, depsLoading, openModal, deleteDepartments, showLoader]
	);

	React.useEffect(() => {
		setRows(getRows(departments, updateDep, handleDelete, depLoading));
	}, [departments, updateDep, handleDelete, depLoading]);

	return (
		<div className="mt-4 rounded-lg py-2 md:py-3 lg:py-4">
			<Table
				heads={heads}
				rows={rows}
				tick
				actions={{
					actions: [
						{
							title: 'Delete departments',
							value: 'del_dep',
							onSubmit: handleDeleteMultiple,
						},
					],
				}}
			/>
		</div>
	);
};

export default DepartmentTable;
